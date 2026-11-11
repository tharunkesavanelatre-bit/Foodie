"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  UserRound,
  Mail,
  LockKeyhole,
  ArrowRight,
  Utensils,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import "./login.css";

interface FoodieUser {
  name: string;
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const storedUsers = localStorage.getItem("foodie_users");

      const users: FoodieUser[] = storedUsers
        ? JSON.parse(storedUsers)
        : [];

      const existingUser = users.find(
        (user) =>
          user.email.toLowerCase() === email.trim().toLowerCase() &&
          user.password === password
      );

      if (!existingUser) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // SAVE LOGGED-IN USER
      localStorage.setItem(
        "foodie_session",
        JSON.stringify({
          name: existingUser.name,
          email: existingUser.email,
        })
      );

      // OPEN PROFILE
      router.push("/profile");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-decoration login-decoration-one"></div>
      <div className="login-decoration login-decoration-two"></div>

      <div className="login-container">

        {/* LEFT EDITORIAL SECTION */}
        <section className="login-intro">

          <Link href="/home" className="login-logo">
            <span className="login-logo-icon">
              <Utensils size={25} />
            </span>

            <span>
              Foodie<span className="login-logo-dot">.</span>
            </span>
          </Link>

          <div className="login-intro-content">

            <div className="login-eyebrow">
              A WORLD OF FLAVOUR
            </div>

            <h1>
              A LITTLE
              <br />
              TASTE OF
              <br />
              <span>HAPPINESS.</span>
            </h1>

            <p>
              Life is too short for boring food.
              Discover flavours that make every moment
              a little more delicious.
            </p>

            <div className="login-benefit">
              <ShieldCheck size={18} />
              Your next delicious experience starts here.
            </div>

          </div>

          <div className="login-intro-footer">
            Fresh food. Happy moments.
          </div>

        </section>

        {/* RIGHT LOGIN SECTION */}
        <section className="login-form-section">

          <div className="login-form-card">

            <div className="login-form-heading">

              <div className="login-heading-icon">
                <UserRound size={25} />
              </div>

              <h2>Welcome Back!</h2>

              <p>
                Enter your details to access your account.
              </p>

            </div>

            <form onSubmit={handleLogin}>

              {/* EMAIL */}
              <div className="login-field">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="login-input-wrapper">

                  <Mail size={19} />

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div className="login-field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="login-input-wrapper">

                  <LockKeyhole size={19} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* SIGN IN */}
              <button
                type="submit"
                className="login-submit-button"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}

                {!loading && <ArrowRight size={19} />}
              </button>

            </form>

            <div className="login-divider">
              <span>NEW TO FOODIE?</span>
            </div>

            {/* REGISTER */}
            <Link
              href="/register"
              className="login-register-button"
            >
              Create an Account
            </Link>

            {/* HOME */}
            <Link
              href="/home"
              className="login-home-link"
            >
              Back to Home
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}