import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import DatasetManager from "../pages/admin/DatasetManager";
import GovernanceLogs from "../pages/admin/GovernanceLogs";
import SearchLogs from "../pages/admin/SearchLogs";
import Settings from "../pages/admin/Settings";
import Users from "../pages/admin/Users";
import Analytics from "../pages/user/Analytics";
import Dashboard from "../pages/user/Dashboard";
import DatasetDetails from "../pages/user/DatasetDetails";
import Datasets from "../pages/user/Datasets";
import History from "../pages/user/History";
import Profile from "../pages/user/Profile";
import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/public/LoginPage";
import NotFound from "../pages/public/NotFound";
import RegisterPage from "../pages/public/RegisterPage";

const AppRoutes = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <UserLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="datasets" element={<Datasets />} />
                        <Route path="datasets/:tableName" element={<DatasetDetails />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="history" element={<History />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminRoute>
                                    <AdminLayout />
                                </AdminRoute>
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="datasets" element={<DatasetManager />} />
                        <Route path="users" element={<Users />} />
                        <Route path="search-logs" element={<SearchLogs />} />
                        <Route path="governance" element={<GovernanceLogs />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default AppRoutes;
