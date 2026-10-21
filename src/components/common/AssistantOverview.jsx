import { useContext } from "react";
import { FiArrowRight, FiBookOpen, FiDatabase, FiMessageSquare } from "react-icons/fi";
import { AssistantContext } from "../../context/assistantContextValue";

export default function AssistantOverview() {
    const assistant = useContext(AssistantContext);
    return (
        <section className="assistant-overview modern-section" id="research-assistant" aria-labelledby="assistant-overview-title">
            <div className="assistant-overview-intro">
                <p className="section-kicker">BEYOND VISUALIZATION · AI RESEARCH PREVIEW</p>
                <h2 id="assistant-overview-title">Ask better questions.<br /><span>Connect data with context.</span></h2>
                <p>We’re building a conversational layer for crime-data exploration and Indian legal-document research. Two ways to investigate, in one assistant.</p>
                <button type="button" className="modern-button" onClick={() => assistant?.openAssistant()}><FiMessageSquare /> Explore the assistant preview <FiArrowRight /></button>
                <small>FastAPI integration coming soon. Live answers and personal chat sessions are not available yet.</small>
            </div>
            <div className="assistant-capabilities">
                <article><span className="assistant-capability-icon"><FiDatabase /></span><span className="assistant-eyebrow">01 / ASK THE DATA</span><h3>From plain language to records.</h3><p>Ask about crime data. The planned workflow builds a dynamic database query, retrieves results, and gives those results to an LLM for a readable explanation.</p><div className="assistant-flow"><span>Question</span><FiArrowRight /><span>Query + records</span><FiArrowRight /><span>Explanation</span></div></article>
                <article><span className="assistant-capability-icon"><FiBookOpen /></span><span className="assistant-eyebrow">02 / ASK THE DOCUMENTS</span><h3>Legal context, grounded in sources.</h3><p>A planned RAG workflow will retrieve relevant passages from six Indian crime-law and constitutional reference PDFs, with source references to help you verify the response.</p><div className="assistant-flow"><span>Question</span><FiArrowRight /><span>Source passages</span><FiArrowRight /><span>Context</span></div></article>
            </div>
        </section>
    );
}