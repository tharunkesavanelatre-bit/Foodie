"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Utensils,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ChefHat,
} from "lucide-react";

type User = {
  name: string;
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const users: User[] = JSON.parse(
      localStorage.getItem("fooddie_users") || "[]"
    );

    const user = users.find(
      (item) =>
        item.email === email.trim().toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setMessage("Invalid email or password");
      return;
    }

    localStorage.setItem(
      "fooddie_session",
      JSON.stringify({
        name: user.name,
        email: user.email,
      })
    );

    window.dispatchEvent(new Event("fooddie-auth-change"));

    alert("Login successful!");
    router.push("/");
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <div className="auth-card">
        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            <span className="auth-logo-icon">
              <Utensils size={23} />
            </span>
            fooddie<span>.</span>
          </Link>

          <span className="auth-welcome-badge">
            <Sparkles size={14} />
            WELCOME BACK
          </span>
        </div>

        <div className="auth-heading">
          <div className="auth-heading-icon">
            <ChefHat size={27} />
          </div>

          <h1>Good to see you again!</h1>

          <p>
            Sign in to continue discovering your favourite foods.
          </p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {message && (
            <p className="auth-error">{message}</p>
          )}

          <button type="submit" className="auth-submit">
            Sign In
            <ArrowRight size={19} />
          </button>
        </form>

        <div className="auth-divider">
          <span />
          <p>NEW TO FOODDIE?</p>
          <span />
        </div>

        <p className="auth-switch">
          Don't have an account?
          <Link href="/register">Create Account</Link>
        </p>

        <Link href="/" className="auth-home-link">
          Back to Homepage
        </Link>
      </div>
    </main>
  );
}