import { useState } from "react";

const features = [
    {
        id: 1,
        title: "Crime Analytics",
        icon: "📊",
        description:
            "Analyze crime trends, yearly growth, category distribution and state-wise statistics."
    },
    {
        id: 2,
        title: "Dataset Explorer",
        icon: "📂",
        description:
            "Browse structured datasets and discover crime records across India."
    },
    {
        id: 3,
        title: "Governance Monitoring",
        icon: "🏛️",
        description:
            "Track administrative activities and maintain transparency."
    },
    {
        id: 4,
        title: "Security",
        icon: "🛡️",
        description:
            "Role-based authentication and secure access control."
    },
    {
        id: 5,
        title: "State Insights",
        icon: "🗺️",
        description:
            "Compare crime statistics and trends across Indian states."
    },
    {
        id: 6,
        title: "Reports",
        icon: "📑",
        description:
            "Generate structured reports and analytical summaries."
    }
];

const FeaturesShowcase = () => {

    const [active, setActive] = useState(features[0]);

    return (
        <section
            className="features-showcase"
            data-aos="fade-up"
        >

            <h2>Platform Capabilities</h2>

            <p className="showcase-subtitle">
                Powerful tools for crime analytics, governance and data exploration.
            </p>

            <div className="feature-tabs">

                {features.map((feature) => (

                    <button
                        key={feature.id}
                        className={
                            active.id === feature.id
                                ? "feature-tab active"
                                : "feature-tab"
                        }
                        onClick={() =>
                            setActive(feature)
                        }
                    >
                        {feature.title}
                    </button>

                ))}

            </div>

            <div className="showcase-card">

                <div className="showcase-illustration">

                    <div className="circle"></div>
                    <div className="square"></div>
                    <div className="triangle"></div>

                    <h1>{active.icon}</h1>

                </div>

                <div className="showcase-content">

                    <h3>{active.title}</h3>

                    <p>{active.description}</p>

                </div>

            </div>

        </section>
    );
};

export default FeaturesShowcase;