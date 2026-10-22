export default function LegalSourceResults({ result }) {
    const hits = result.hits || [];
    const explanation = result.explanation;
    const usedIds = new Set(explanation?.points.map(point => point.source_id));
    const references = hits.filter(hit => usedIds.has(hit.source_id));
    const failureMessages = {
        insufficient_sources: "The retrieved excerpts do not support a reliable answer to your question. Please add relevant documents or clarify the question; unrelated passages are not evidence.",
        timeout: "The AI analysis timed out. Please submit your question again. References are available below.",
        provider_error: "The AI service could not complete the analysis. Please try again. References are available below.",
        invalid_response: "The AI response did not pass source-reference validation. Please try again; an unchecked answer has not been shown.",
        not_configured: "The AI analysis service is not configured. Document search is available, but an administrator needs to enable the analysis service.",
    };
    return <section className="assistant-legal-results" aria-label="Document research results">
        {explanation && <section className="assistant-explanation" aria-label="Source-grounded analysis">
            {[["answer", "Answer to your question"], ["analysis", "Analysis and explanation"], ["steps", "Steps supported by the sources"]].map(([kind, title]) => {
                const points = explanation.points.filter(point => (point.kind || "analysis") === kind);
                if (!points.length) return null;
                return <section key={kind}><h3>{title}</h3>{points.map((point, index) => <p key={index}>{point.text} <sup>[{references.findIndex(hit => hit.source_id === point.source_id) + 1}]</sup></p>)}</section>;
            })}
            {explanation.limitations?.length > 0 && <section><h3>What still needs verification</h3><ul>{explanation.limitations.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
            {explanation.clarifying_questions?.length > 0 && <section><h3>To make this more useful</h3><ul>{explanation.clarifying_questions.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
            <p className="assistant-citation">{explanation.notice}</p>
        </section>}
        {!explanation && hits.length > 0 && <p role="alert">{failureMessages[result.explanation_status] || "The analysis is unavailable. Please try again; retrieved references remain available below."}</p>}
        {!hits.length && <p>No keyword matches found across the uploaded documents. Try a shorter legal term. This does not prove the documents lack relevant information.</p>}
        <p className="assistant-citation">Searched across all uploaded documents. Only matching evidence is used; not every PDF will be relevant.</p>
        {(explanation ? references : hits).length > 0 && <details className="assistant-references"><summary>References ({(explanation ? references : hits).length}) — editions, pages and supporting text</summary>
        {(explanation ? references : hits).map((hit, index) => <article className="assistant-source" key={hit.source_id}>
            <h4>[{index + 1}] {hit.title}</h4>
            <p><strong>{hit.version_label}</strong> · PDF pages {hit.page_start}–{hit.page_end}</p>
            {hit.section_reference && <p>Indexed reference (unverified): {hit.section_reference}</p>}
            {explanation?.points.filter(point => point.source_id === hit.source_id).map((point, quoteIndex) => <blockquote key={quoteIndex}>{point.quote}</blockquote>)}
            <details><summary>Read source passage</summary><blockquote>{hit.passage}</blockquote>{hit.excerpt_truncated && <small>Excerpt shortened for display.</small>}</details>
        </article>)}</details>}
    </section>;
}