const datasets = [
    {
        icon: "🚗",
        title: "Auto Theft",
        description: "Track vehicle theft trends across India."
    },
    {
        icon: "👥",
        title: "Victims of Rape",
        description: "Analyze crime statistics involving victims."
    },
    {
        icon: "⚠️",
        title: "Serious Fraud",
        description: "Monitor financial and cyber fraud patterns."
    },
    {
        icon: "🏠",
        title: "Police Housing",
        description: "Explore police infrastructure datasets."
    },
    {
        icon: "📦",
        title: "Property Recovery",
        description: "Recovered property and asset records."
    },
    {
        icon: "🏛️",
        title: "Human Rights Violations",
        description: "Insights into human rights related crimes."
    }
];

const FeaturedDatasets = () => {
    return (
        <section className="datasets-section">

            <h2>Featured Datasets</h2>

            <div className="dataset-grid">

                {datasets.map((dataset, index) => (

                    <div
                        key={index}
                        className="dataset-card"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                    >

                        <div className="dataset-icon">
                            {dataset.icon}
                        </div>

                        <h3>{dataset.title}</h3>

                        <p>{dataset.description}</p>

                        <button>
                            View Dataset →
                        </button>

                    </div>

                ))}

            </div>

        </section>
    );
};

export default FeaturedDatasets;