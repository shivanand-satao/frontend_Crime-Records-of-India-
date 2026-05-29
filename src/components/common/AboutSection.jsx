const AboutSection = () => {
    return (
        <section className="about-section">
            <h2>About the Platform</h2>

            <p>
                Crime Records of India is a centralized
                analytics and governance platform
                designed to provide structured access
                to crime-related datasets across India.
            </p>

            <div className="tech-stack">
                <span>React</span>
                <span>Node.js</span>
                <span>MySQL</span>
                <span>Redis</span>
                <span>Docker</span>
            </div>
        </section>
    );
};

export default AboutSection;