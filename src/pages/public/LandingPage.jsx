import Navbar from "../../components/common/Navbar";
import HeroSection from "../../components/common/HeroSection";
import StatsSection from "../../components/common/StatsSection";
import FeaturedDatasets from "../../components/common/FeaturedDatasets";
import FeaturesSection from "../../components/common/FeaturesSection";
import AboutSection from "../../components/common/AboutSection";
import Footer from "../../components/common/Footer";
import StateCrimeDistribution from "../../components/common/StateCrimeDistribution";
import FeaturesShowcase from "../../components/common/FeaturesShowcase";
import AboutPlatform from "../../components/common/AboutPlatform";

const LandingPage = () => {
    return (
        <>
            <Navbar />
            <HeroSection />
            <StateCrimeDistribution />
            <StatsSection />
            <FeaturedDatasets />
            <FeaturesShowcase />
            <AboutPlatform />
            <Footer />
        </>
    );
};

export default LandingPage;