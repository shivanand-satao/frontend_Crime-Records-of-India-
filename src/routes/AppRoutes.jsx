import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/public/LoginPage";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;