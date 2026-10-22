import { useContext } from "react";
import { FiArrowRight, FiBookOpen, FiDatabase, FiMessageSquare } from "react-icons/fi";
import { AssistantContext } from "../../context/assistantContextValue";

export default function AssistantOverview() {
    const assistant = useContext(AssistantContext);
    return (
        <section className="assistant-overview modern-section" id="research-assistant" aria-labelledby="assistant-overview-title">
            <div className="assistant-overview-intro">
                <p className="section-kicker">REFERENCE DOCUMENT SEARCH · BETA</p>
                <h2 id="assistant-overview-title">Ask better questions.<br /><span>Connect data with context.</span></h2>
                <p>Search uploaded Indian legal-reference PDFs for keyword matches and inspect source passages with edition and PDF page references. Explore crime records separately through the website’s dataset tools.</p>
                <button type="button" className="modern-button" onClick={() => assistant?.openAssistant()}><FiMessageSquare /> Explore the assistant <FiArrowRight /></button>
                <small>Sign in for source search and experimental AI-planned dataset queries. Generated legal answers and saved chats are not enabled. Historical texts and bills must not be treated as current law.</small>
            </div>
            <div className="assistant-capabilities">
                <article><span className="assistant-capability-icon"><FiDatabase /></span><span className="assistant-eyebrow">01 / ASK THE DATA</span><h3>From plain language to records.</h3><p>Select an approved dataset. Groq proposes a query plan, the server validates it, and a read-only connection retrieves records. Review the plan and filters: AI interpretation and statistical meaning are not guaranteed.</p><div className="assistant-flow"><span>Question</span><FiArrowRight /><span>Validated plan</span><FiArrowRight /><span>Records</span></div></article>
                <article><span className="assistant-capability-icon"><FiBookOpen /></span><span className="assistant-eyebrow">02 / SEARCH THE DOCUMENTS</span><h3>Inspect the source passages.</h3><p>Keyword search over uploaded reference PDFs returns candidate passages, edition labels, and PDF page numbers. Matches are not verified answers or legal advice.</p><div className="assistant-flow"><span>Keywords</span><FiArrowRight /><span>Candidate passages</span><FiArrowRight /><span>Inspect sources</span></div></article>
            </div>
        </section>
    );
}