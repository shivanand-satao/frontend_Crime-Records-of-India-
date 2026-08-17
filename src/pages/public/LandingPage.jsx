import Navbar from "../../components/common/Navbar";
import HeroSection from "../../components/common/HeroSection";
import StatsSection from "../../components/common/StatsSection";
import FeaturedDatasets from "../../components/common/FeaturedDatasets";
import Footer from "../../components/common/Footer";
import StateCrimeDistribution from "../../components/common/StateCrimeDistribution";
import FeaturesShowcase from "../../components/common/FeaturesShowcase";
import AboutPlatform from "../../components/common/AboutPlatform";

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <HeroSection />
            <StateCrimeDistribution />
            <StatsSection />
            <FeaturedDatasets />
            <FeaturesShowcase />
            <AboutPlatform />
            <Footer />
        </div>
    );
};

export default LandingPage;
