import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getHomePath } from "../utils/roleHelper";

const AdminRoute = ({ children }) => {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        return <Navigate to={getHomePath()} replace />;
    }

    return children;
};

export default AdminRoute;
