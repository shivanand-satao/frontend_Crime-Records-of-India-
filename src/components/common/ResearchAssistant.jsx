import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUp, FiBookOpen, FiDatabase, FiMessageSquare, FiShield, FiX } from "react-icons/fi";
import { AuthContext } from "../../context/authContextValue";
import { AssistantContext } from "../../context/assistantContextValue";
import chatService from "../../services/chatService";
import "../../styles/assistant.css";

const modes = {
    data: {
        label: "Crime data", icon: FiDatabase,
        description: "Ask a question in everyday language. The planned service will query relevant records and explain the returned data.",
        prompts: ["Compare reported auto theft across available years", "Which datasets cover property stolen and recovered?"],
        workflow: "Your question → dynamic database query → returned records → AI explanation",
    },
    legal: {
        label: "Legal documents", icon: FiBookOpen,
        description: "Explore the planned document-grounded assistant for six Indian crime-law and constitutional reference PDFs.",
        prompts: ["Find references to constitutional safeguards in the documents", "Explain a legal term with references to the source pages"],
        workflow: "Your question → relevant document passages (RAG) → source-grounded explanation",
    },
};

function AssistantPanel({ close, authenticated }) {
    const [mode, setMode] = useState("legal");
    const [draft, setDraft] = useState("");
    const [submitted, setSubmitted] = useState("");
    const headingRef = useRef(null);
    const inputRef = useRef(null);
    const requestRef = useRef(null);
    const [connection, setConnection] = useState("idle");
    const [documents, setDocuments] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [table, setTable] = useState("");
    const [documentId, setDocumentId] = useState("");
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const current = modes[mode];

    useEffect(() => { headingRef.current?.focus(); }, []);
    useEffect(() => {
        if (!authenticated) return undefined;
        const controller = new AbortController();
        let active = true;
        Promise.all([chatService.status(controller.signal), chatService.documents(controller.signal)])
            .then(([status, list]) => {
                if (!active) return;
                setConnection(status.data?.retrieval_enabled ? "ready" : "unavailable");
                setDocuments(list.data?.documents || []);
            })
            .catch(() => { if (active) setConnection("unavailable"); });
        return () => { active = false; controller.abort(); requestRef.current?.abort(); };
    }, [authenticated, attempt]);
    useEffect(() => {
        if (!authenticated) return undefined;
        const controller = new AbortController();
        chatService.datasets(controller.signal).then(response => {
            if (!controller.signal.aborted) setDatasets(response.data?.datasets || []);
        }).catch(() => { if (!controller.signal.aborted) setDatasets([]); });
        return () => controller.abort();
    }, [authenticated, attempt]);

    const submit = async (event) => {
        event.preventDefault();
        if (!draft.trim() || busy) return;
        const question = draft.trim();
        setSubmitted(question); setResult(null); setError("");
        if (!authenticated) { setDraft(""); return; }
        if (mode === "data" && !table) { setError("Select a dataset before asking a crime-data question."); return; }
        const controller = new AbortController();
        requestRef.current?.abort(); requestRef.current = controller;
        setBusy(true);
        try {
            const response = mode === "data"
                ? await chatService.ask(question, table, controller.signal)
                : await chatService.search(question, documentId, controller.signal);
            if (!controller.signal.aborted) { setResult(response.data); setDraft(""); setConnection("ready"); }
        } catch (failure) {
            if (!controller.signal.aborted) setError(failure?.status === 429
                ? "Too many requests. Wait a minute and try again."
                : failure?.status === 401 ? "Your session expired. Please sign in again."
                    : "Source search is unavailable or waking up. Your question is still in the box; retry shortly.");
        } finally { if (!controller.signal.aborted) setBusy(false); }
    };

    const chooseMode = (next) => {
        requestRef.current?.abort(); setBusy(false); setError(""); setResult(null);
        setMode(next);
        setDraft("");
        setSubmitted("");
    };

    return (
        <section className="assistant-panel" role="dialog" aria-modal="false" aria-labelledby="assistant-title"
            onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
            <header className="assistant-header">
                <span className="assistant-avatar"><FiMessageSquare aria-hidden="true" /></span>
                <div><h2 id="assistant-title" tabIndex={-1} ref={headingRef}>Research assistant</h2><span>Crime Records of India · Source search beta</span></div>
                <button type="button" className="assistant-icon-button" aria-label="Close research assistant" onClick={close}><FiX /></button>
            </header>
            <div className="assistant-body">
                <div className="assistant-status"><span />{!authenticated ? "Sign in to search source documents" : connection === "ready" ? "Source search connected · Keyword matches" : connection === "unavailable" ? "Service unavailable or waking up" : "Checking source search…"}</div>
                {authenticated && connection === "unavailable" && <button type="button" onClick={() => { setConnection("idle"); setAttempt(value => value + 1); }}>Retry connection</button>}
                <h3>A question is a good place to start.</h3>
                <p>Explore crime records or put legal documents in context. Choose your research direction.</p>
                <div className="assistant-modes" role="group" aria-label="Research assistant mode">
                    {Object.entries(modes).map(([key, { label, icon: Icon }]) => <button key={key} type="button" aria-pressed={mode === key} onClick={() => chooseMode(key)}><Icon aria-hidden="true" />{label}</button>)}
                </div>
                <div className="assistant-mode-copy"><p>{mode === "legal" ? "Search the uploaded reference PDFs by keywords. Read matching source passages with edition and PDF page references. This beta does not generate legal answers." : "Choose a dataset and ask for records. Groq proposes a restricted query plan; the server validates it and returns database results. Review the plan: AI can misunderstand your question."}</p><small>{mode === "legal" ? "Question → keyword search → candidate source passages" : "Question → validated AI query plan → read-only database results"}</small></div>
                {authenticated && mode === "data" && <label className="assistant-document-filter">Crime dataset<select aria-label="Crime dataset" value={table} onChange={event => { requestRef.current?.abort(); setBusy(false); setTable(event.target.value); setResult(null); setError(""); }}><option value="">Select a dataset</option>{datasets.map(dataset => <option key={dataset.table} value={dataset.table}>{dataset.label}</option>)}</select><small>Your question and selected public schema are sent to Groq. Returned records are not sent to Groq. Do not include personal information.</small>{!datasets.length && <small>Dataset service unavailable or waking up. Use Retry connection to try again.</small>}</label>}
                {authenticated && mode === "legal" && <label className="assistant-document-filter">Source document<select aria-label="Source document" value={documentId} onChange={event => { requestRef.current?.abort(); setBusy(false); setDocumentId(event.target.value); setResult(null); setError(""); }}><option value="">All uploaded editions</option>{documents.map(doc => <option key={doc.id} value={doc.id}>{doc.title} — {doc.version_label}</option>)}</select></label>}
                <span className="assistant-eyebrow">TRY A QUESTION</span>
                <div className="assistant-prompts">{current.prompts.map((prompt) => <button key={prompt} type="button" onClick={() => { setDraft(prompt); setSubmitted(""); inputRef.current?.focus(); }}>{prompt}<FiArrowUp aria-hidden="true" /></button>)}</div>
                {busy && <p role="status">Searching source passages… Free hosting can take time to wake up.</p>}
                {error && <p role="alert">{error}</p>}
                {submitted && !busy && <div className="assistant-preview-result" role="status"><strong>Your question</strong><p>{submitted}</p>{!authenticated && <p>No request was sent. Sign in to search source passages. No data or legal answer has been generated.</p>}{result && <><p>{result.notice}</p>{result.mode === "data" ? <><p>{result.message || `${result.returned_rows} rows returned from ${result.table}.`}</p>{result.plan && <details><summary>Review AI-selected query plan</summary><pre className="assistant-plan">{JSON.stringify(result.plan, null, 2)}</pre></details>}{result.rows?.length > 0 ? <div className="assistant-table-scroll"><table><thead><tr>{result.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{result.rows.map((row, index) => <tr key={index}>{result.columns.map(column => <td key={column}>{row[column] === null ? "NULL" : String(row[column])}</td>)}</tr>)}</tbody></table></div> : result.status !== "unsupported" && <p>No records matched the generated filters. Check exact location spellings and year coverage.</p>}{(result.limit_reached || result.display_truncated) && <p>Results may be incomplete because the query or display limit was reached.</p>}</> : <>{!result.hits?.length && <p>No keyword matches found. Try a shorter legal term or choose another document. This does not prove the documents lack relevant information.</p>}{result.hits?.map(hit => <article className="assistant-source" key={hit.source_id}><h4>{hit.title}</h4><p><strong>{hit.version_label}</strong> · PDF pages {hit.page_start}–{hit.page_end}</p>{hit.section_reference && <p>Indexed reference (unverified): {hit.section_reference}</p>}<blockquote>{hit.passage}</blockquote>{hit.excerpt_truncated && <small>Excerpt shortened for display.</small>}<small>{hit.source_id}</small></article>)}</>}</>}</div>}
                <div className="assistant-account"><FiShield aria-hidden="true" /><p>{authenticated ? "You’re signed in. Searches are sent through your backend. Questions and results are not saved; personal chat history is not enabled." : <><Link to="/login" onClick={close}>Sign in</Link> to search the reference PDFs.</>}</p></div>
            </div>
            <form className="assistant-composer" onSubmit={submit}>
                <label htmlFor="assistant-question">Your research question</label>
                <div><textarea id="assistant-question" ref={inputRef} rows={2} maxLength={1500} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={mode === "legal" ? "Try a legal term, such as right to freedom" : "Show murder records in Maharashtra in 2012"} aria-describedby="assistant-privacy" /><button type="submit" disabled={!draft.trim() || busy || (authenticated && mode === "data" && !table)} aria-label={authenticated ? mode === "data" ? "Query dataset" : "Search sources" : "Preview question"}><FiArrowUp /></button></div>
                {authenticated && mode === "data" && !table && <p id="assistant-dataset-required" role="status">Choose a dataset above to enable Send. Suggested questions only fill the question box.</p>}
                <p id="assistant-privacy">{mode === "data" ? "AI-planned query: review the selected dataset and filters. Don’t enter personal information." : "Keyword search, not AI legal advice. Editions may be historical texts or bills, not current law. Don’t enter personal case details."}</p>
            </form>
        </section>
    );
}

export default function ResearchAssistant({ children }) {
    const [open, setOpen] = useState(false);
    const auth = useContext(AuthContext);
    const launcherRef = useRef(null);
    const identity = auth?.isAuthenticated ? JSON.stringify([auth.user?.account_kind, auth.user?.id, auth.user?.username, auth.user?.email, auth.user?.role]) : "guest";
    const close = () => { setOpen(false); launcherRef.current?.focus(); };

    return (
        <AssistantContext.Provider value={{ openAssistant: () => setOpen(true) }}>
            {children}
            <aside className="research-assistant" aria-label="Research assistant widget">
                {open && <AssistantPanel key={identity} close={close} authenticated={Boolean(auth?.isAuthenticated)} />}
                <button className="assistant-launcher" ref={launcherRef} type="button" aria-label={open ? "Hide research assistant" : "Open research assistant"} aria-expanded={open} onClick={() => setOpen(!open)}>
                    <span className="assistant-launcher-icon">{open ? <FiX aria-hidden="true" /> : <FiMessageSquare aria-hidden="true" />}</span>
                    <span className="assistant-launcher-copy"><strong>{open ? "Close assistant" : "Ask the AI assistant"}</strong>{!open && <span>Crime data & legal documents</span>}</span>
                    <small>BETA</small>
                </button>
            </aside>
        </AssistantContext.Provider>
    );
}