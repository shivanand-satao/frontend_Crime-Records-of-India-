export default function LegalSourceResults({ result }) {
    const hits = result.hits || [];
    return <section className="assistant-legal-results" aria-label="Document research results">
        <p><strong>Searched across all uploaded documents.</strong> Matching excerpts are shown below; not every document will contain a relevant match.</p>
        {result.explanation && <section className="assistant-explanation" aria-label="Plain-language explanation">
            <h3>In plain language</h3>
            <p>{result.explanation.notice}</p>
            <ul>{result.explanation.points.map((point, index) => {
                const source = hits.find(hit => hit.source_id === point.source_id);
                return <li key={index}><p>{point.text}</p>{source && <p className="assistant-citation"><strong>{source.title}</strong> — {source.version_label}, PDF pages {source.page_start}–{source.page_end}</p>}<details><summary>Read supporting quotation</summary><blockquote>{point.quote}</blockquote></details></li>;
            })}</ul>
        </section>}
        {!result.explanation && hits.length > 0 && <p>The plain-language explanation is unavailable or the excerpts are insufficient to support one. You can still inspect the matching passages below.</p>}
        {!hits.length && <p>No keyword matches found across the uploaded documents. Try a shorter legal term. This does not prove the documents lack relevant information.</p>}
        {hits.length > 0 && <h3>Source passages ({hits.length})</h3>}
        {hits.map((hit, index) => <article className="assistant-source" key={hit.source_id}>
            <h4>{index + 1}. {hit.title}</h4>
            <p><strong>{hit.version_label}</strong> · PDF pages {hit.page_start}–{hit.page_end}</p>
            {hit.section_reference && <p>Indexed reference (unverified): {hit.section_reference}</p>}
            <details><summary>Read source passage</summary><blockquote>{hit.passage}</blockquote>{hit.excerpt_truncated && <small>Excerpt shortened for display.</small>}</details>
        </article>)}
    </section>;
}