import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUp, FiBookOpen, FiDatabase, FiMessageSquare, FiShield, FiX } from "react-icons/fi";
import { AuthContext } from "../../context/authContextValue";
import { AssistantContext } from "../../context/assistantContextValue";
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
    const [mode, setMode] = useState("data");
    const [draft, setDraft] = useState("");
    const [submitted, setSubmitted] = useState("");
    const headingRef = useRef(null);
    const inputRef = useRef(null);
    const current = modes[mode];

    useEffect(() => { headingRef.current?.focus(); }, []);

    const chooseMode = (next) => {
        setMode(next);
        setDraft("");
        setSubmitted("");
    };

    return (
        <section className="assistant-panel" role="dialog" aria-modal="false" aria-labelledby="assistant-title"
            onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
            <header className="assistant-header">
                <span className="assistant-avatar"><FiMessageSquare aria-hidden="true" /></span>
                <div><h2 id="assistant-title" tabIndex={-1} ref={headingRef}>Research assistant</h2><span>Crime Records of India · Preview</span></div>
                <button type="button" className="assistant-icon-button" aria-label="Close research assistant" onClick={close}><FiX /></button>
            </header>
            <div className="assistant-body">
                <div className="assistant-status"><span /> Service not connected · UI preview</div>
                <h3>A question is a good place to start.</h3>
                <p>Explore crime records or put legal documents in context. Choose your research direction.</p>
                <div className="assistant-modes" role="group" aria-label="Research assistant mode">
                    {Object.entries(modes).map(([key, { label, icon: Icon }]) => <button key={key} type="button" aria-pressed={mode === key} onClick={() => chooseMode(key)}><Icon aria-hidden="true" />{label}</button>)}
                </div>
                <div className="assistant-mode-copy"><p>{current.description}</p><small>{current.workflow}</small></div>
                <span className="assistant-eyebrow">TRY A QUESTION</span>
                <div className="assistant-prompts">{current.prompts.map((prompt) => <button key={prompt} type="button" onClick={() => { setDraft(prompt); setSubmitted(""); inputRef.current?.focus(); }}>{prompt}<FiArrowUp aria-hidden="true" /></button>)}</div>
                {submitted && <div className="assistant-preview-result" role="status"><strong>Your preview question</strong><p>{submitted}</p><p>No request was sent. Once FastAPI is connected, this mode will follow the workflow above. No data or legal answer has been generated.</p></div>}
                <div className="assistant-account"><FiShield aria-hidden="true" /><p>{authenticated ? "You’re signed in. Personal chat sessions will become available when the service is connected." : <>Browsing the preview? <Link to="/login" onClick={close}>Sign in</Link> for your workspace. Personal chat sessions are planned for the connected service.</>}</p></div>
            </div>
            <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); if (draft.trim()) { setSubmitted(draft.trim()); setDraft(""); } }}>
                <label htmlFor="assistant-question">Your research question</label>
                <div><textarea id="assistant-question" ref={inputRef} rows={2} maxLength={1500} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What would you like to understand?" aria-describedby="assistant-privacy" /><button type="submit" disabled={!draft.trim()} aria-label="Preview question"><FiArrowUp /></button></div>
                <p id="assistant-privacy">Preview only. Drafts are not saved or sent. Don’t enter personal case details. Legal research is not legal advice.</p>
            </form>
        </section>
    );
}

export default function ResearchAssistant({ children }) {
    const [open, setOpen] = useState(false);
    const auth = useContext(AuthContext);
    const launcherRef = useRef(null);
    const identity = auth?.isAuthenticated ? JSON.stringify([auth.user?.id, auth.user?.username, auth.user?.email, auth.user?.role]) : "guest";
    const close = () => { setOpen(false); launcherRef.current?.focus(); };

    return (
        <AssistantContext.Provider value={{ openAssistant: () => setOpen(true) }}>
            {children}
            <aside className="research-assistant" aria-label="Research assistant widget">
                {open && <AssistantPanel key={identity} close={close} authenticated={Boolean(auth?.isAuthenticated)} />}
                <button className="assistant-launcher" ref={launcherRef} type="button" aria-label={open ? "Hide research assistant" : "Open research assistant"} aria-expanded={open} onClick={() => setOpen(!open)}>
                    {open ? <FiX aria-hidden="true" /> : <FiMessageSquare aria-hidden="true" />}<span>{open ? "Close" : "Ask a question"}</span><small>PREVIEW</small>
                </button>
            </aside>
        </AssistantContext.Provider>
    );
}