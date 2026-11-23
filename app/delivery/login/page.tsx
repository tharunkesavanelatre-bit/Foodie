"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bike, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

import "./login.css";

export default function DeliveryLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (data.user?.role !== "DELIVERY_PARTNER") {
        await fetch("/api/auth/logout", {
          method: "POST",
        });

        setError(
          "Your account is not an approved delivery partner account."
        );
        return;
      }

      localStorage.setItem(
        "fooddie_session",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        })
      );

      router.replace("/delivery");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="delivery-login-page">
      <section className="delivery-login-card">
        <Link href="/" className="delivery-login-brand">
          fooddie<span>.</span>
        </Link>

        <div className="delivery-login-icon">
          <Bike size={30} />
        </div>

        <h1>Delivery Partner Login</h1>

        <p className="delivery-login-description">
          Sign in to manage your deliveries and start earning.
        </p>

        <form onSubmit={handleLogin} className="delivery-login-form">
          <label htmlFor="email">Email address</label>

          <div className="delivery-login-input">
            <Mail size={19} />
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <label htmlFor="password">Password</label>

          <div className="delivery-login-input">
            <Lock size={19} />
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="delivery-login-error">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="delivery-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="delivery-login-footer">
          <Link href="/">Back to Foodie</Link>
        </div>
      </section>
    </main>
  );
}