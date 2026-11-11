"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Utensils,
} from "lucide-react";

import "./register.css";

interface RegisteredUser {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const storedUsers = localStorage.getItem("foodie_users");
      const users: RegisteredUser[] = storedUsers
        ? JSON.parse(storedUsers)
        : [];

      if (!Array.isArray(users)) {
        setError("Unable to read saved accounts. Please try again.");
        return;
      }

      const existingUser = users.find(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existingUser) {
        setError("This email is already registered. Please log in.");
        return;
      }

      const newUser: RegisteredUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      users.push(newUser);

      localStorage.setItem("foodie_users", JSON.stringify(users));

      // Save the logged-in user's public details.
      localStorage.setItem(
        "foodie_session",
        JSON.stringify({
          name: newUser.name,
          email: newUser.email,
        })
      );

      router.push("/profile");
    } catch {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <main className="register-page">
      <div className="register-container">

        <Link href="/home" className="register-logo">
          <span className="register-logo-icon">
            <Utensils size={23} />
          </span>
          Foodie<span>.</span>
        </Link>

        <section className="register-card">

          <div className="register-heading">
            <span className="register-eyebrow">JOIN FOODIE</span>
            <h1>Create your account</h1>
            <p>Sign up and discover your next favourite meal.</p>
          </div>

          <form onSubmit={handleRegister} className="register-form">

            <label>Full Name</label>
            <div className="register-input">
              <UserRound size={19} />
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <label>Email Address</label>
            <div className="register-input">
              <Mail size={19} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <label>Password</label>
            <div className="register-input">
              <LockKeyhole size={19} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <label>Confirm Password</label>
            <div className="register-input">
              <LockKeyhole size={19} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && <p className="register-error">{error}</p>}

            <button type="submit" className="register-submit">
              Create Account
              <ArrowRight size={18} />
            </button>

          </form>

          <div className="register-login">
            Already have an account?
            <Link href="/login">Log in</Link>
          </div>

        </section>

        <p className="register-footer">
          Good food. Great moments. Welcome to Foodie.
        </p>

      </div>
    </main>
  );
}