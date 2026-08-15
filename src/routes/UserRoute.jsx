import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const UserRoute = ({ children }) => {
    const { isAdmin } = useAuth();

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default UserRoute;