const AboutPlatform = () => {
    return (
        <section className="about-platform">

            <h2>About The Platform</h2>

            <div className="about-card react-card">

                <div className="about-content">

                    <h3>⚛ React Frontend</h3>

                    <p>
                        Modern responsive user interface built
                        with React and Vite.
                    </p>

                    <ul>
                        <li>Fast Rendering</li>
                        <li>Responsive Design</li>
                        <li>Interactive Dashboards</li>
                    </ul>

                </div>

                <div className="card-graphic">
                    ⚛
                </div>

            </div>

            <div className="about-card node-card">

                <div className="about-content">

                    <h3>🚀 Node.js Backend</h3>

                    <p>
                        Powerful APIs for analytics,
                        authentication and governance.
                    </p>

                    <ul>
                        <li>REST APIs</li>
                        <li>Role Based Access</li>
                        <li>Scalable Architecture</li>
                    </ul>

                </div>

                <div className="card-graphic">
                    🚀
                </div>

            </div>

            <div className="about-card mysql-card">

                <div className="about-content">

                    <h3>🗄 MySQL Database</h3>

                    <p>
                        Structured storage for crime
                        records across India.
                    </p>

                    <ul>
                        <li>Relational Data</li>
                        <li>Efficient Queries</li>
                        <li>Data Integrity</li>
                    </ul>

                </div>

                <div className="card-graphic">
                    🗄
                </div>

            </div>

            <div className="about-card redis-card">

                <div className="about-content">

                    <h3>⚡ Redis Cache</h3>

                    <p>
                        Improves performance through
                        intelligent caching.
                    </p>

                    <ul>
                        <li>Fast Access</li>
                        <li>Reduced Load</li>
                        <li>Better Performance</li>
                    </ul>

                </div>

                <div className="card-graphic">
                    ⚡
                </div>

            </div>

            <div className="about-card docker-card">

                <div className="about-content">

                    <h3>🐳 Docker Deployment</h3>

                    <p>
                        Containerized infrastructure for
                        reliable deployment.
                    </p>

                    <ul>
                        <li>Easy Deployment</li>
                        <li>Portable Environment</li>
                        <li>Scalable Setup</li>
                    </ul>

                </div>

                <div className="card-graphic">
                    🐳
                </div>

            </div>

        </section>
    );
};

export default AboutPlatform;