import { useState } from "react";
import { FiLock, FiShield, FiUser } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getPostLoginPath } from "../../utils/roleHelper";

const LoginPage = () => {
    const [mode, setMode] = useState("user");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const user = await login({ identifier, password, mode });
            const targetPath = getPostLoginPath(user.role, location.state?.from?.pathname);
            navigate(targetPath, { replace: true });
        } catch (loginError) {
            setError(loginError.message || "Login failed. Check your credentials and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <Link to="/" className="auth-brand">Crime Records of India</Link>
                <div className="auth-header">
                    <p className="eyebrow">Secure access</p>
                    <h1>Sign in to the portal</h1>
                </div>

                <div className="segmented-control">
                    <button className={mode === "user" ? "active" : ""} onClick={() => setMode("user")} type="button">
                        <FiUser /> User
                    </button>
                    <button className={mode === "admin" ? "active" : ""} onClick={() => setMode("admin")} type="button">
                        <FiShield /> Admin
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        <span>Username</span>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(event) => setIdentifier(event.target.value)}
                            placeholder={mode === "admin" ? "Admin username" : "Your username"}
                            required
                        />
                    </label>
                    <label>
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Your password"
                            required
                        />
                    </label>

                    {error && <p className="form-error">{error}</p>}

                    <button className="primary-action" disabled={isSubmitting} type="submit">
                        <FiLock />
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="auth-note">
                    New user? <Link to="/register">Create an account</Link>
                </p>
            </section>
        </main>
    );
};

export default LoginPage;
