import { Link } from "react-router-dom";

const HeroSection = () => {
    return (
        <section className="hero">

            <h1>
                Crime Records of India
            </h1>

            <p>
                National Crime Analytics and Governance Platform
            </p>

            <div className="hero-buttons">

                <Link to="/login">
                    <button>
                        Login
                    </button>
                </Link>

                <button>
                    Explore Datasets
                </button>

            </div>

        </section>
    );
};

export default HeroSection;