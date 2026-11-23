"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChefHat,
  Mail,
  Lock,
  ArrowRight,
  Utensils,
} from "lucide-react";

export default function RestaurantLoginPage() {
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
        setMessage(data.message || "Login failed.");
        return;
      }

      if (data.user.role !== "RESTAURANT") {
        await fetch("/api/auth/logout", { method: "POST" });
        setMessage("This account is not an approved restaurant account.");
        return;
      }

      localStorage.setItem(
        "fooddie_session",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(new Event("fooddie-auth-change"));

      router.push("/restaurant");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            <span className="auth-logo-icon">
              <Utensils size={23} />
            </span>
            fooddie<span>.</span>
          </Link>
        </div>

        <div className="auth-heading">
          <div className="auth-heading-icon">
            <ChefHat size={27} />
          </div>

          <h1>Restaurant Login</h1>

          <p>Sign in to manage your restaurant on FOODDIE.</p>
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
                placeholder="restaurant@example.com"
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

          {message && <p className="auth-error">{message}</p>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <ArrowRight size={19} />}
          </button>
        </form>

        <p className="auth-switch">
          Customer account?
          <Link href="/login">Customer Login</Link>
        </p>

        <Link href="/" className="auth-home-link">
          Back to Homepage
        </Link>
      </div>
    </main>
  );
}