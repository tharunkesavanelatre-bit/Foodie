"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Utensils,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ChefHat,
} from "lucide-react";

type RegisteredUser = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const users: RegisteredUser[] = JSON.parse(
      localStorage.getItem("fooddie_users") || "[]"
    );

    const normalizedEmail = email.trim().toLowerCase();

    const exists = users.find(
      (user) => user.email === normalizedEmail
    );

    if (exists) {
      setMessage("Email already registered");
      return;
    }

    users.push({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    localStorage.setItem("fooddie_users", JSON.stringify(users));

    alert("Account created successfully!");
    router.push("/login");
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <div className="auth-card register-card">
        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            <span className="auth-logo-icon">
              <Utensils size={23} />
            </span>
            fooddie<span>.</span>
          </Link>

          <span className="auth-welcome-badge">
            <Sparkles size={14} />
            JOIN FOODDIE
          </span>
        </div>

        <div className="auth-heading">
          <div className="auth-heading-icon">
            <ChefHat size={27} />
          </div>

          <h1>Create Your Account</h1>

          <p>
            Join FOODDIE and discover something delicious every day.
          </p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-field">
            <label>Full Name</label>

            <div className="auth-input-wrapper">
              <User size={19} />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Email Address</label>

            <div className="auth-input-wrapper">
              <Mail size={19} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>

            <div className="auth-input-wrapper">
              <Lock size={19} />
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
            </div>
          </div>

          {message && (
            <p className="auth-error">{message}</p>
          )}

          <button type="submit" className="auth-submit">
            Create Account
            <ArrowRight size={19} />
          </button>
        </form>

        <div className="auth-divider">
          <span />
          <p>ALREADY A MEMBER?</p>
          <span />
        </div>

        <p className="auth-switch">
          Already have an account?
          <Link href="/login">Sign In</Link>
        </p>

        <Link href="/" className="auth-home-link">
          Back to Homepage
        </Link>
      </div>
    </main>
  );
}