import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "./LandingPage";

const renderPage = () => render(<MemoryRouter><LandingPage /></MemoryRouter>);

describe("Modern crime records landing page", () => {
    test("keeps crime branding and existing dataset destinations", () => {
        renderPage();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Understand the records.");
        expect(screen.getByRole("link", { name: "Crime Records of India home" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", { name: /^Explore datasets/ })).toHaveAttribute("href", "/dashboard/datasets");
        const datasetLinks = screen.getAllByRole("link", { name: "Explore dataset", exact: true });
        expect(datasetLinks).toHaveLength(6);
        expect(datasetLinks[0]).toHaveAttribute("href", "/dashboard/datasets/auto_theft");
        expect(screen.getByText(/Illustrative visualization/)).toBeInTheDocument();
    });

    test("switches the workspace feature preview", () => {
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /Discover patterns/ }));
        expect(screen.getByRole("heading", { name: "Put the records in perspective." })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Discover patterns/ })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("button", { name: /Keep a trail/ }));
        expect(screen.getByRole("heading", { name: "Research with a little more clarity." })).toBeInTheDocument();
    });

    test("opens mobile navigation and closes it after selecting a destination", () => {
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
        expect(screen.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
        fireEvent.click(screen.getByRole("link", { name: "Platform", exact: true }));
        expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
    });

    test("provides expandable FAQs and real account links", () => {
        renderPage();
        expect(screen.getByText("What can I explore here?").closest("details")).not.toHaveAttribute("open");
        expect(screen.getByRole("link", { name: /^Create your account/ })).toHaveAttribute("href", "/register");
        expect(screen.getByText(/No. This is a data exploration platform/)).toBeInTheDocument();
    });

    test("switches research paths without changing account permissions", () => {
        renderPage();
        expect(screen.getByRole("button", { name: "Researchers" })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("button", { name: "Administrators" }));
        expect(screen.getByRole("heading", { name: "A focused view of platform oversight." })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open admin portal" })).toHaveAttribute("href", "/admin");
        expect(screen.getByText(/Admin authorization required/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Data explorers" }));
        expect(screen.getByRole("link", { name: "Explore analytics" })).toHaveAttribute("href", "/dashboard/analytics");
        expect(screen.getByRole("button", { name: "Administrators" })).toHaveAttribute("aria-pressed", "false");
    });

    test("connects tool cards to the existing protected routes", () => {
        renderPage();
        expect(screen.getByRole("link", { name: /Governance workspace Dedicated/ })).toHaveAttribute("href", "/admin/governance");
        expect(screen.getByRole("link", { name: /Activity history Pick up/ })).toHaveAttribute("href", "/dashboard/history");
        expect(screen.getByRole("link", { name: "Research paths" })).toHaveAttribute("href", "#research-paths");
    });
});