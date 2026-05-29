const Footer = () => {
    return (
        <footer className="footer">

            <div className="footer-top">

                <div className="footer-column">

                    <h2>
                        <span>Crime</span> Records of India
                    </h2>

                    <p>
                        Crime Records of India is a centralized
                        analytics and governance platform
                        providing structured access to crime
                        datasets across India.
                    </p>

                    <h4>Join Us</h4>

                    <p>
                        Explore crime trends and help build
                        a safer society through data-driven
                        insights.
                    </p>

                </div>

                <div className="footer-column">

                    <h3>Quick Links</h3>

                    <ul>
                        <li>Home</li>
                        <li>Datasets</li>
                        <li>Analytics</li>
                        <li>Login</li>
                        <li>Admin Portal</li>
                    </ul>

                </div>

                <div className="footer-column">

                    <h3>Contact Us</h3>

                    <p>Pune, Maharashtra, India</p>
                    <p>+91 95793 25554</p>
                    <p>support@crimeindia.com</p>

                </div>

                <div className="footer-column">

                    <h3>Technology Stack</h3>

                    <p>React</p>
                    <p>Node.js</p>
                    <p>MySQL</p>
                    <p>Redis</p>
                    <p>Docker</p>

                </div>

            </div>

            <div className="footer-bottom">

                <p>
                    © 2026 Crime Records of India.
                    All Rights Reserved.
                </p>

                <p>
                    Developed by Shivanand Satao
                </p>

            </div>

        </footer>
    );
};

export default Footer;