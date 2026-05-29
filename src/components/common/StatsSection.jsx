const stats = [
    {
        icon: "📂",
        number: "17+",
        title: "Crime Datasets",
        description: "National crime records across India"
    },
    {
        icon: "📊",
        number: "500K+",
        title: "Crime Records",
        description: "Structured and searchable data"
    },
    {
        icon: "🌐",
        number: "24/7",
        title: "Real-Time Access",
        description: "Access analytics anytime"
    },
    {
        icon: "🛡️",
        number: "100%",
        title: "Secure Platform",
        description: "Role-based protected access"
    }
];

const StatsSection = () => {
    return (
        <section className="stats-section">

            <h2>Platform Capabilities</h2>

            <div className="stats-grid">

                {stats.map((stat, index) => (

                    <div
                        key={index}
                        className="stat-card"
                        data-aos="zoom-in-up"
                        data-aos-delay={index * 150}
                    >

                        <div className="stat-icon">
                            {stat.icon}
                        </div>

                        <h3>{stat.number}</h3>

                        <h4>{stat.title}</h4>

                        <p>{stat.description}</p>

                    </div>

                ))}

            </div>

        </section>
    );
};

export default StatsSection;