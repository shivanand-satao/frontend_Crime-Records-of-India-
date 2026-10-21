import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiBookOpen, FiCheck, FiClock, FiDatabase, FiSearch, FiShield } from "react-icons/fi";

const paths = [
    {
        label: "Researchers", icon: FiBookOpen, title: "Start with a question. Follow the evidence.",
        description: "Move from a broad crime-related topic to a specific dataset. Inspect the available fields and coverage before building your analysis.",
        checklist: ["Explore the dataset collection", "Inspect columns and records", "Revisit your browsing history"],
        to: "/dashboard/datasets", action: "Find a dataset", panel: "Your research route",
        route: ["Choose a research question", "Browse relevant datasets", "Inspect the available records"],
    },
    {
        label: "Data explorers", icon: FiSearch, title: "Make room for your next discovery.",
        description: "Get familiar with the collection, explore the analytics workspace, and keep your browsing activity within reach.",
        checklist: ["Browse crime-related topics", "Explore workspace analytics", "Keep track of viewed datasets"],
        to: "/dashboard/analytics", action: "Explore analytics", panel: "Your discovery route",
        route: ["Explore the collection", "Open workspace analytics", "Return to your activity history"],
    },
    {
        label: "Administrators", icon: FiShield, title: "A focused view of platform oversight.",
        description: "Authorized administrators have a dedicated workspace for dataset management, user administration, and governance activity.",
        checklist: ["Manage the dataset catalog", "Review users and search logs", "Inspect governance activity"],
        to: "/admin", action: "Open admin portal", panel: "Your oversight route",
        route: ["Sign in with an admin account", "Review platform activity", "Open governance tools"],
    },
];

const tools = [
    { icon: FiDatabase, title: "Dataset explorer", description: "A direct path from a topic to the available records.", to: "/dashboard/datasets", className: "tool-card-wide" },
    { icon: FiBarChart2, title: "Analytics workspace", description: "Explore catalog coverage and platform activity.", to: "/dashboard/analytics", className: "tool-card-lilac" },
    { icon: FiClock, title: "Activity history", description: "Pick up where your last question left off.", to: "/dashboard/history", className: "tool-card-sage" },
    { icon: FiShield, title: "Governance workspace", description: "Dedicated oversight tools for authorized administrators.", to: "/admin/governance", className: "tool-card-dark" },
];

const ResearchPaths = () => {
    const [selected, setSelected] = useState(0);
    const path = paths[selected];

    return (
        <>
            <section className="research-paths modern-section" id="research-paths" aria-labelledby="paths-heading">
                <div className="section-intro">
                    <p className="section-kicker">DIFFERENT QUESTIONS. ONE CONNECTED PLATFORM.</p>
                    <h2 id="paths-heading">Find your research path.</h2>
                    <p>A starting point that fits the way you explore.</p>
                </div>
                <div className="path-options" role="group" aria-label="Choose your research path">
                    {paths.map(({ label, icon: Icon }, index) => (
                        <button key={label} type="button" aria-pressed={selected === index} aria-controls="research-path-content" onClick={() => setSelected(index)}>
                            <Icon />{label}
                        </button>
                    ))}
                </div>
                <div className="path-panel" id="research-path-content" aria-live="polite">
                    <div className="path-copy">
                        <span className="path-audience">FOR {path.label.toUpperCase()}</span>
                        <h3>{path.title}</h3>
                        <p>{path.description}</p>
                        <ul>{path.checklist.map((item) => <li key={item}><FiCheck />{item}</li>)}</ul>
                        <Link to={path.to} className="modern-button">{path.action}<FiArrowRight /></Link>
                    </div>
                    <div className="path-map">
                        <div className="path-map-heading"><FiDatabase aria-hidden="true" /><span>{path.panel}</span><span className="path-map-dot" /></div>
                        <ol>{path.route.map((item, index) => <li key={item}><span>0{index + 1}</span><div><small>STEP {index + 1}</small><strong>{item}</strong></div><FiArrowRight /></li>)}</ol>
                        <p><FiShield />{selected === 2 ? "Admin authorization required. Roles are not changed here." : "Sign in to access your workspace."}</p>
                    </div>
                </div>
            </section>
            <section className="connected-tools modern-section" aria-labelledby="tools-heading">
                <div className="section-heading-row"><div><p className="section-kicker">BUILT TO WORK TOGETHER</p><h2 id="tools-heading">Your tools. A single starting point.</h2><p>Less jumping between pages. More room to explore.</p></div><Link className="text-link" to="/dashboard">Go to workspace <FiArrowRight /></Link></div>
                <div className="tools-bento">{tools.map(({ icon: Icon, title, description, to, className }) => (
                    <Link className={`connected-tool ${className}`} key={title} to={to}>
                        <span className="connected-tool-icon"><Icon /></span>
                        <div><h3>{title}</h3><p>{description}</p></div>
                        <span className="connected-tool-arrow" aria-hidden="true"><FiArrowRight /></span>
                    </Link>
                ))}</div>
            </section>
        </>
    );
};

export default ResearchPaths;