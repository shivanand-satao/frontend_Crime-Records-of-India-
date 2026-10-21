import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResearchAssistant from "./ResearchAssistant";
import AssistantOverview from "./AssistantOverview";
import { AuthContext } from "../../context/authContextValue";

const tree = (auth = { isAuthenticated: false }) => <MemoryRouter><AuthContext.Provider value={auth}><ResearchAssistant><AssistantOverview /></ResearchAssistant></AuthContext.Provider></MemoryRouter>;

describe("Research assistant preview", () => {
    test("keeps the assistant purpose and preview badge visible before opening", () => {
        render(tree());
        const launcher = screen.getByRole("button", { name: "Open research assistant" });
        expect(launcher).toHaveTextContent("Ask the AI assistant");
        expect(launcher).toHaveTextContent("Crime data & legal documents");
        expect(launcher).toHaveTextContent("PREVIEW");
        expect(launcher).toHaveAttribute("aria-expanded", "false");
        fireEvent.click(launcher);
        expect(screen.getByRole("button", { name: "Hide research assistant" })).toHaveTextContent("Close assistant");
    });
    test("opens from the homepage overview and closes with Escape, returning focus", () => {
        render(tree());
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /Explore the assistant preview/ }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Service not connected · UI preview")).toBeInTheDocument();
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
        expect(screen.getByText(/You’re signed in/)).toHaveTextContent("when the service is connected");
        fireEvent.change(screen.getByLabelText("Your research question"), { target: { value: "Private draft" } });
        rerender(tree({ isAuthenticated: true, user: { id: 2 } }));
        expect(screen.getByLabelText("Your research question")).toHaveValue("");
        fireEvent.change(screen.getByLabelText("Your research question"), { target: { value: "Another draft" } });
        rerender(tree());
        expect(screen.getByLabelText("Your research question")).toHaveValue("");
        expect(screen.getByRole("link", { name: "Sign in", exact: true })).toBeInTheDocument();
    });
});