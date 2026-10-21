import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiCheck, FiDatabase, FiFilter, FiGrid, FiLayers, FiLock, FiSearch, FiShield } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import FeaturedDatasets from "../../components/common/FeaturedDatasets";
import ResearchPaths from "../../components/common/ResearchPaths";

const views = [
    { name: "Explore datasets", icon: FiDatabase, title: "A clearer view of crime data.", description: "Browse structured records by topic, inspect their columns, and find the dataset your research needs.", rows: ["Auto theft", "Serious fraud", "Property stolen and recovered"], tag: "Dataset explorer" },
    { name: "Discover patterns", icon: FiBarChart2, title: "Put the records in perspective.", description: "Open your analytics workspace to explore dataset coverage and platform activity in one place.", rows: ["Dataset coverage", "Search activity", "Most viewed records"], tag: "Analytics workspace" },
    { name: "Keep a trail", icon: FiShield, title: "Research with a little more clarity.", description: "Return to your browsing history, manage your profile, and keep research activity organized.", rows: ["Recently viewed datasets", "Search history", "Your research profile"], tag: "Research workspace" },
];
const questions = [
    ["What can I explore here?", "The platform brings crime-related datasets into a structured workspace, with dataset browsing, record inspection, analytics, and activity history."],
    ["Do I need an account?", "You can explore this overview without signing in. Create an account or sign in to access the dataset and analytics workspaces."],
    ["Are the preview charts live crime statistics?", "No. The homepage preview is illustrative. Open a dataset in the workspace and check its source, coverage, and fields before drawing conclusions."],
    ["Is this an emergency reporting service?", "No. This is a data exploration platform, not an emergency service or a place to file a police complaint. Contact the appropriate authorities for assistance."],
];
const steps = [
    { number: "01", icon: FiSearch, title: "Find your starting point.", text: "Explore crime-related topics and find a dataset that fits your question." },
    { number: "02", icon: FiDatabase, title: "Get into the details.", text: "Inspect records and fields. Understand what the data includes—and what it doesn’t." },
    { number: "03", icon: FiBarChart2, title: "Build your perspective.", text: "Explore the analytics workspace and revisit your research through activity history." },
];

const LandingPage = () => {
    const [activeView, setActiveView] = useState(0);
    const view = views[activeView];
    return (
        <div className="landing-page modern-landing">
            <a className="skip-link" href="#main-content">Skip to content</a>
            <div className="announcement"><span>A clearer perspective</span> Crime data. Context. Discovery. <a href="#datasets">Explore the collection <FiArrowRight /></a></div>
            <Navbar />
            <main id="main-content">
                <section className="modern-hero">
                    <p className="pill-label"><span /> BUILT FOR CURIOUS MINDS. GROUNDED IN DATA.</p>
                    <h1>Understand the records.<br />See the <span>bigger picture.</span></h1>
                    <p className="hero-description">Make sense of India’s crime data in one focused workspace.<br className="desktop-break" /> Explore datasets, uncover context, and turn information into insight.</p>
                    <div className="modern-actions"><Link className="modern-button" to="/dashboard/datasets">Explore datasets <FiArrowRight /></Link><a className="modern-button button-light" href="#how-it-works">See how it works <span aria-hidden="true">↗</span></a></div>
                    <p className="hero-footnote"><FiCheck /> Structured datasets <span>·</span><FiCheck /> One research workspace</p>
                    <div className="product-stage" id="analytics">
                        <div className="stage-caption"><span>✦</span> Less searching. More understanding.</div>
                        <div className="product-window">
                            <div className="window-chrome"><div className="window-dots"><i /><i /><i /></div><span><FiLock /> Crime Records of India / workspace preview</span><FiGrid /></div>
                            <div className="preview-layout">
                                <aside className="preview-sidebar"><div className="preview-brand"><FiShield /> Crime Records<span>RESEARCH WORKSPACE</span></div><span className="preview-nav-label">WORKSPACE</span><div className="preview-nav-item selected"><FiDatabase /> Dataset explorer</div><div className="preview-nav-item"><FiBarChart2 /> Analytics</div><div className="preview-nav-item"><FiLayers /> Activity history</div><div className="preview-sidebar-note"><FiShield /><strong>Context matters.</strong><p>Check coverage and source before interpreting a record.</p></div></aside>
                                <div className="preview-content"><div className="preview-heading"><div><p>YOUR NEXT INSIGHT STARTS HERE</p><h2>Explore with perspective.</h2></div><span className="preview-avatar">CR</span></div><div className="preview-search"><FiSearch /> Search crime datasets <span><FiFilter /> Filters</span></div><div className="preview-metrics"><div><FiDatabase /><strong>Discover</strong><span>Structured records</span></div><div><FiBarChart2 /><strong>Explore</strong><span>Data in context</span></div><div><FiShield /><strong>Inspect</strong><span>Source & coverage</span></div></div><div className="preview-chart"><div><strong>A new perspective on the records</strong><span>Illustrative visualization · not live crime statistics</span></div><div className="chart-columns" aria-hidden="true">{[38, 62, 48, 80, 57, 91, 68, 84, 60, 96, 76, 88].map((height, index) => <i key={index} style={{ "--bar-height": `${height}%` }} />)}</div><div className="chart-axis"><span>Browse</span><span>Compare</span><span>Understand</span></div></div></div>
                            </div>
                        </div>
                        <div className="floating-note"><span><FiCheck /></span><div><strong>Your research, connected.</strong><p>Records → context → insight</p></div></div>
                    </div>
                </section>
                <section className="research-strip" aria-label="Research topics"><p>A focused home for crime-data exploration</p><div><span><FiShield /> Public safety</span><span><FiDatabase /> Crime records</span><span><FiBarChart2 /> Data research</span><span><FiLayers /> Governance</span></div></section>
                <section className="modern-section workflow-section" id="how-it-works"><div className="section-intro"><p className="section-kicker">FROM INFORMATION TO UNDERSTANDING</p><h2>Less friction.<br />More informed exploration.</h2><p>Good research starts with the right record.<br />Keep the path from discovery to detail simple.</p></div><div className="workflow-grid">{steps.map(({ number, icon: Icon, title, text }) => <article className="workflow-card" key={number}><div className="workflow-card-top"><span>{number}</span><Icon /></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
                <section className="feature-split modern-section" id="features"><div className="feature-copy"><p className="section-kicker">ONE CONNECTED WORKSPACE</p><h2>Everything in view.<br /><span>Nothing in the way.</span></h2><p>A thoughtful workspace for exploring crime records, without the noise.</p><div className="feature-selector" aria-label="Workspace features">{views.map(({ name, icon: Icon }, index) => <button type="button" key={name} aria-pressed={activeView === index} onClick={() => setActiveView(index)}><Icon /><span>{name}</span><FiArrowRight /></button>)}</div><Link className="text-link" to="/dashboard">Open your workspace <FiArrowRight /></Link></div><div className="feature-demo" aria-live="polite"><div className="feature-demo-label"><span /><span>{view.tag}</span><FiGrid /></div><div className="feature-demo-body"><span className="feature-demo-icon"><FiLayers /></span><h3>{view.title}</h3><p>{view.description}</p><div className="feature-demo-rows">{view.rows.map((row, index) => <div key={row}><span>0{index + 1}</span><strong>{row}</strong><FiArrowRight /></div>)}</div><span className="preview-disclaimer">Interface preview · sign in to explore your data</span></div></div></section>
                <ResearchPaths />
                <div className="modern-section collection-section"><div className="section-heading-row"><div><p className="section-kicker">THE COLLECTION</p><h2>Follow your curiosity.</h2><p>Different questions. A more organized place to start.</p></div><Link className="text-link" to="/dashboard/datasets">Browse all datasets <FiArrowRight /></Link></div><FeaturedDatasets /></div>
                <section className="responsible-section modern-section"><span className="responsible-icon"><FiShield /></span><div><p className="section-kicker">RESEARCH WITH RESPONSIBILITY</p><h2>Behind every record,<br />there’s real-world context.</h2><p>Data can inform better questions, but it doesn’t tell the whole story. Consider reporting differences, time periods, definitions, and source limitations before making comparisons.</p></div></section>
                <section className="modern-section faq-section"><div><p className="section-kicker">A LITTLE MORE CLARITY</p><h2>Good questions.<br />Straightforward answers.</h2><p>Before you start exploring.</p></div><div className="faq-list">{questions.map(([question, answer], index) => <details key={question}><summary><span>0{index + 1}</span>{question}<span className="faq-toggle" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
                <section className="closing-section"><p className="section-kicker">YOUR NEXT QUESTION DESERVES A BETTER START</p><h2>A clearer view.<br />A more informed tomorrow.</h2><p>Start exploring the stories within the records.</p><Link to="/register" className="modern-button">Create your account <FiArrowRight /></Link><Link className="closing-signin" to="/login">Already have an account? Sign in ↗</Link></section>
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
