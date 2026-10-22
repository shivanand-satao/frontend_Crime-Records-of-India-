import { render, screen } from "@testing-library/react";
import LegalSourceResults from "./LegalSourceResults";

test("formats explanation and citations from multiple documents as safe text", () => {
    const hits = [1, 2].map(id => ({ source_id: `source:${id}`, title: `Document ${id}`,
        version_label: "Historical edition", page_start: id, page_end: id, passage: "Original source passage" }));
    render(<LegalSourceResults result={{ hits, explanation: { notice: "Not current-law advice.",
        points: hits.map(hit => ({ text: `Explanation for ${hit.title}`, source_id: hit.source_id,
            quote: "<script>untrusted()</script>" })) } }} />);
    expect(screen.getByText("In plain language")).toBeInTheDocument();
    expect(screen.getByText("Explanation for Document 1")).toBeInTheDocument();
    expect(screen.getByText("Explanation for Document 2")).toBeInTheDocument();
    expect(screen.getByText(/Searched across all uploaded/)).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
});

test("explains no matches without suggesting a document filter", () => {
    render(<LegalSourceResults result={{ hits: [] }} />);
    expect(screen.getByText(/No keyword matches found across/)).toBeInTheDocument();
});