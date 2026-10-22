import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResearchAssistant from "./ResearchAssistant";
import AssistantOverview from "./AssistantOverview";
import { AuthContext } from "../../context/authContextValue";
import chatService from "../../services/chatService";

jest.mock("../../services/chatService", () => ({ __esModule: true, default: {
    status: jest.fn(), documents: jest.fn(), search: jest.fn(), datasets: jest.fn(), ask: jest.fn(),
} }));

beforeEach(() => {
    jest.clearAllMocks();
    chatService.status.mockResolvedValue({ data: { retrieval_enabled: true } });
    chatService.documents.mockResolvedValue({ data: { documents: [] } });
    chatService.datasets.mockResolvedValue({ data: { datasets: [{ table: "crime", label: "Crime dataset" }] } });
});

const tree = (auth = { isAuthenticated: false }) => <MemoryRouter><AuthContext.Provider value={auth}><ResearchAssistant><AssistantOverview /></ResearchAssistant></AuthContext.Provider></MemoryRouter>;

describe("Research assistant preview", () => {
    test("keeps the assistant purpose and preview badge visible before opening", () => {
        render(tree());
        const launcher = screen.getByRole("button", { name: "Open research assistant" });
        expect(launcher).toHaveTextContent("Ask the AI assistant");
        expect(launcher).toHaveTextContent("Crime data & legal documents");
        expect(launcher).toHaveTextContent("BETA");
        expect(launcher).toHaveAttribute("aria-expanded", "false");
        fireEvent.click(launcher);
        expect(screen.getByRole("button", { name: "Hide research assistant" })).toHaveTextContent("Close assistant");
    });
    test("opens from the homepage overview and closes with Escape, returning focus", () => {
        render(tree());
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /Explore the assistant/ }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Sign in to search source documents")).toBeInTheDocument();
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Open research assistant" })).toHaveFocus();
    });

    test("supports mode selection, suggestions, and honest preview submissions", () => {
        render(tree());
        fireEvent.click(screen.getByRole("button", { name: "Open research assistant" }));
        expect(screen.getByRole("button", { name: "Preview question" })).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Legal documents", exact: true }));
        expect(screen.getByRole("button", { name: "Legal documents", exact: true })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("button", { name: /Find references to constitutional safeguards/ }));
        expect(screen.getByLabelText("Your research question")).toHaveValue("Find references to constitutional safeguards in the documents");
        fireEvent.click(screen.getByRole("button", { name: "Preview question" }));
        expect(screen.getByRole("status")).toHaveTextContent("No request was sent");
        expect(screen.getByLabelText("Your research question")).toHaveValue("");
        expect(screen.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/login");
        fireEvent.click(screen.getByRole("button", { name: "Crime data", exact: true }));
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    test("clears draft state across account changes and logout without creating fake sessions", () => {
        const { rerender } = render(tree({ isAuthenticated: true, user: { id: 1 } }));
        fireEvent.click(screen.getByRole("button", { name: "Open research assistant" }));
        expect(screen.getByText(/You’re signed in/)).toHaveTextContent("not saved");
        fireEvent.change(screen.getByLabelText("Your research question"), { target: { value: "Private draft" } });
        rerender(tree({ isAuthenticated: true, user: { id: 2 } }));
        expect(screen.getByLabelText("Your research question")).toHaveValue("");
        fireEvent.change(screen.getByLabelText("Your research question"), { target: { value: "Another draft" } });
        rerender(tree());
        expect(screen.getByLabelText("Your research question")).toHaveValue("");
        expect(screen.getByRole("link", { name: "Sign in", exact: true })).toBeInTheDocument();
    });

    test("authenticated search renders actual source text and edition without HTML execution", async () => {
        chatService.search.mockResolvedValue({ data: { notice: "Candidate only; not current-law advice.", hits: [{
            source_id: "document:1:chunk:2:revision:1", title: "Reference book", version_label: "Historical edition",
            page_start: 12, page_end: 13, passage: "<script>untrusted()</script>",
        }] } });
        render(tree({ isAuthenticated: true, user: { id: 1 } }));
        fireEvent.click(screen.getByRole("button", { name: "Open research assistant" }));
        await screen.findByText("Source search connected · Keyword matches");
        fireEvent.change(screen.getByLabelText("Your research question"), { target: { value: "freedom" } });
        fireEvent.click(screen.getByRole("button", { name: "Search sources" }));
        expect(await screen.findByText("1. Reference book")).toBeInTheDocument();
        expect(screen.getByText("<script>untrusted()</script>")).toBeInTheDocument();
        expect(screen.getByText(/PDF pages 12–13/)).toBeInTheDocument();
        expect(chatService.search.mock.calls[0][0]).toBe("freedom");
        expect(chatService.search.mock.calls[0]).toHaveLength(2);
        expect(chatService.search.mock.calls[0][1]).toBeInstanceOf(AbortSignal);
        expect(screen.queryByRole("combobox", { name: "Source document" })).not.toBeInTheDocument();
        expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    test("aborts search on account change and does not render stale results", async () => {
        let complete;
        chatService.search.mockReturnValue(new Promise(resolve => { complete = resolve; }));
        const { rerender } = render(tree({ isAuthenticated: true, user: { id: 1 } }));
        fireEvent.click(screen.getByRole("button", { name: "Open research assistant" }));
        await screen.findByText("Source search connected · Keyword matches");
        fireEvent.change(screen.getByLabelText("Your research question"), { target: { value: "private" } });
        fireEvent.click(screen.getByRole("button", { name: "Search sources" }));
        const signal = chatService.search.mock.calls[0][1];
        rerender(tree({ isAuthenticated: true, user: { id: 2 } }));
        expect(signal.aborted).toBe(true);
        complete({ data: { hits: [{ source_id: "secret", title: "Other account result" }] } });
        await waitFor(() => expect(screen.getByLabelText("Your research question")).toHaveValue(""));
        expect(screen.queryByText("Other account result")).not.toBeInTheDocument();
    });

    test("failed search preserves draft for retry and reports failure honestly", async () => {
        chatService.search.mockRejectedValue({ status: 503 });
        render(tree({ isAuthenticated: true, user: { id: 1 } }));
        fireEvent.click(screen.getByRole("button", { name: "Open research assistant" }));
        await screen.findByText("Source search connected · Keyword matches");
        fireEvent.change(screen.getByLabelText("Your research question"), { target: { value: "freedom" } });
        fireEvent.click(screen.getByRole("button", { name: "Search sources" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("unavailable or waking up");
        expect(screen.getByLabelText("Your research question")).toHaveValue("freedom");
    });

    test("data mode requires dataset and displays real records with query plan", async () => {
        chatService.ask.mockResolvedValue({ data: { mode: "data", table: "crime", returned_rows: 1,
            columns: ["year", "murder"], rows: [{ year: 2012, murder: 10 }],
            plan: { table: "crime", columns: ["year", "murder"], limit: 5 }, notice: "Review the AI query." } });
        render(tree({ isAuthenticated: true, user: { id: 1 } }));
        fireEvent.click(screen.getByRole("button", { name: "Open research assistant" }));
        fireEvent.click(screen.getByRole("button", { name: "Crime data", exact: true }));
        await screen.findByRole("option", { name: "Crime dataset" });
        fireEvent.change(screen.getByLabelText("Your research question"), { target: { value: "show murder" } });
        expect(screen.getByRole("button", { name: "Query dataset" })).toBeDisabled();
        expect(screen.getByText(/Choose a dataset above to enable Send/)).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText("Crime dataset"), { target: { value: "crime" } });
        expect(screen.queryByText(/Choose a dataset above to enable Send/)).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Query dataset" })).toBeEnabled();
        fireEvent.click(screen.getByRole("button", { name: "Query dataset" }));
        expect(await screen.findByRole("cell", { name: "2012" })).toBeInTheDocument();
        expect(screen.getByText("Review AI-selected query plan")).toBeInTheDocument();
        expect(chatService.ask.mock.calls[0].slice(0, 2)).toEqual(["show murder", "crime"]);
    });
});