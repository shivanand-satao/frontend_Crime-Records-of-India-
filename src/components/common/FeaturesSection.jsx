const features = [
    {
        title: "Analytics",
        description:
            "Visualize crime trends and patterns."
    },
    {
        title: "Dataset Exploration",
        description:
            "Search and explore multiple datasets."
    },
    {
        title: "Governance",
        description:
            "Track administrative activities."
    },
    {
        title: "Security",
        description:
            "Role-based access and authentication."
    }
];

const FeaturesSection = () => {
    return (
        <section className="features-section">
            <h2>Platform Features</h2>

            <div className="features-grid">
                {features.map((feature, index) => (
                    <div className="feature-card" key={index}>
                        <h3>{feature.title}</h3>

                        <p>
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;