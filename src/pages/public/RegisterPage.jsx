import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const RegisterPage = () => {
  const [form, setForm] = useState({ username: "", full_name: "", email: "", password: "", department: "" });
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
      const payload = {
        ...form,
        username: form.username.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department.trim(),
      };

      await authService.register(payload);
      setMessage("Account created. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (registerError) {
      setError(
        registerError.status === 409
          ? "That username or email is already registered. Use a new username and a different email address."
          : registerError.message || "Registration failed."
      );
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
            <input autoComplete="username" value={form.username} onChange={(event) => updateField("username", event.target.value)} required />
          </label>
          <label>
            <span>Full name</span>
            <input autoComplete="name" value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} required />
          </label>
          <label>
            <span>Email</span>
            <input autoComplete="email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input autoComplete="new-password" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} required />
          </label>
          <label>
            <span>Department</span>
            <input value={form.department} onChange={(event) => updateField("department", event.target.value)} placeholder="Analysis" />
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
