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

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem(
        "fooddie_session",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(new Event("fooddie-auth-change"));

      alert("Login successful!");

      if (data.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <ArrowRight size={19} />}
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