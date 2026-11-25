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

import { useToast } from "@/components/ui/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.message || "Registration failed";

        setMessage(errorMessage);
        showToast(errorMessage, "error");
        return;
      }

      showToast(
        "Your account has been created successfully!",
        "success"
      );

      router.push("/login");
    } catch {
      const errorMessage =
        "Something went wrong. Please try again.";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
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
            Foodie<span>.</span>
          </Link>

          <span className="auth-welcome-badge">
            <Sparkles size={14} />
            JOIN Foodie
          </span>
        </div>

        <div className="auth-heading">
          <div className="auth-heading-icon">
            <ChefHat size={27} />
          </div>

          <h1>Create Your Account</h1>

          <p>
            Join Foodie and discover something delicious every day.
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

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && <ArrowRight size={19} />}
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

