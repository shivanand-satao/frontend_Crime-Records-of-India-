const datasets = [
    "Auto Theft",
    "Victims of Rape",
    "Serious Fraud",
    "Police Housing",
    "Property Recovery",
    "Human Rights Violations"
];

const FeaturedDatasets = () => {
    return (
        <section className="datasets-section">
            <h2>Featured Datasets</h2>

            <div className="dataset-grid">
                {datasets.map((dataset, index) => (
                    <div className="dataset-card" key={index}>
                        <h3>{dataset}</h3>

                        <p>
                            Explore crime trends and statistics.
                        </p>

                        <button>
                            Learn More
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedDatasets;