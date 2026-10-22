import { render, screen } from "@testing-library/react";
import LegalSourceResults from "./LegalSourceResults";

test("formats explanation and citations from multiple documents as safe text", () => {
    const hits = [1, 2].map(id => ({ source_id: `source:${id}`, title: `Document ${id}`,
        version_label: "Historical edition", page_start: id, page_end: id, passage: "Original source passage" }));
    render(<LegalSourceResults result={{ hits, explanation: { notice: "Not current-law advice.",
        points: hits.map(hit => ({ text: `Explanation for ${hit.title}`, source_id: hit.source_id,
            quote: "<script>untrusted()</script>" })) } }} />);
    expect(screen.getByText("Analysis and explanation")).toBeInTheDocument();
    expect(screen.getByText(/Explanation for Document 1/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation for Document 2/)).toBeInTheDocument();
    expect(screen.getByText(/Searched across all uploaded/)).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
});

test("shows answer, steps and evidence gaps before collapsed references", () => {
    render(<LegalSourceResults result={{ hits: [{ source_id: "a", title: "Reference", version_label: "Historical", page_start: 1, page_end: 2 }], explanation: {
        points: [{ kind: "answer", text: "Direct response", source_id: "a", quote: "Source text" },
            { kind: "steps", text: "A conditional step", source_id: "a", quote: "Source text" }],
        limitations: ["Current applicability is not verified."], clarifying_questions: ["Which jurisdiction?"] } }} />);
    expect(screen.getByRole("heading", { name: "Answer to your question" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Steps supported by the sources" })).toBeInTheDocument();
    expect(screen.getByText("Which jurisdiction?")).toBeInTheDocument();
    expect(document.querySelector(".assistant-references")).not.toHaveAttribute("open");
});

test.each(["timeout", "provider_error", "invalid_response", "not_configured", "insufficient_sources"])("distinguishes analysis failure %s", status => {
    render(<LegalSourceResults result={{ explanation_status: status, hits: [{ source_id: "a", title: "Reference" }] }} />);
    expect(screen.getByRole("alert")).not.toHaveTextContent("unavailable or the excerpts");
    expect(screen.getByRole("alert").textContent.length).toBeGreaterThan(30);
});

test("explains no matches without suggesting a document filter", () => {
    render(<LegalSourceResults result={{ hits: [] }} />);
    expect(screen.getByText(/No keyword matches found across/)).toBeInTheDocument();
});