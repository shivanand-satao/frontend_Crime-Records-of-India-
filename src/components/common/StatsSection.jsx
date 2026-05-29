const stats = [
    { number: "17+", label: "Datasets" },
    { number: "500K+", label: "Records" },
    { number: "24/7", label: "Access" },
    { number: "100%", label: "Secure" }
];

const StatsSection = () => {
    return (
        <section className="stats-section">
            <h2>Platform Statistics</h2>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div className="stat-card" key={index}>
                        <h3>{stat.number}</h3>
                        <p>{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StatsSection;