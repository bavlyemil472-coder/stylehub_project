import { useState } from "react";
import "./auth.css";
import API from "../api/axios";


export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.email.includes("@")) {
      newErrors.email = "Invalid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    setLoading(true);

    const response = await API.post("token/", {
      username: form.email,
      password: form.password,
    });

    console.log("Server Response:", response.data);

  } catch (error) {
    console.error("Login Error:", error.response?.data);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="auth-btn">
            Login
          </button>

        </form>
      </div>
    </div>
  );
}
