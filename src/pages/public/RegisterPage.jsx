import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const RegisterPage = () => {
  const [form, setForm] = useState({ username: "", full_name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await authService.register(form);
      setMessage("Account created. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (registerError) {
      setError(registerError.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">Crime Records of India</Link>
        <div className="auth-header">
          <p className="eyebrow">Research access</p>
          <h1>Create user account</h1>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input value={form.username} onChange={(event) => updateField("username", event.target.value)} required />
          </label>
          <label>
            <span>Full name</span>
            <input value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}
          <button className="primary-action" type="submit" disabled={isSubmitting}>
            <FiUserPlus />
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="auth-note">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
