"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  UserRound,
  Mail,
  ShieldCheck,
  Package,
  ArrowLeft,
  LogOut,
  House,
  ChevronRight,
  Pencil,
  Save,
  X,
} from "lucide-react";

import "./profile.css";

interface UserSession {
  id: string;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // LOAD PROFILE FROM DATABASE
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/customer/profile", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setUser(data.profile);
        setName(data.profile.name);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong."
        );

        if (error instanceof Error && error.message.includes("access")) {
          router.replace("/login");
        }
      } finally {
        setChecking(false);
      }
    }

    loadProfile();
  }, [router]);

  // UPDATE PROFILE
  async function handleSave() {
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setUser(data.profile);
      setName(data.profile.name);
      setEditing(false);
      setMessage("Profile updated successfully.");

      const storedUser = localStorage.getItem("foodie_session");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem(
            "foodie_session",
            JSON.stringify({ ...parsedUser, name: data.profile.name })
          );
        } catch {
          localStorage.removeItem("foodie_session");
        }
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Update failed."
      );
    } finally {
      setSaving(false);
    }
  }

  // LOGOUT
  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      localStorage.removeItem("foodie_session");
      router.replace("/login");
    }
  }

  if (checking) {
    return (
      <div className="profile-loading">
        <div className="profile-loader"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-loading">
        <p>{error || "Please log in to view your profile."}</p>
        <Link href="/login">Go to Login</Link>
      </div>
    );
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <main className="profile-page">
      <div className="profile-decoration profile-decoration-one"></div>
      <div className="profile-decoration profile-decoration-two"></div>

      <div className="profile-container">
        <div className="profile-breadcrumb">
          <Link href="/">
            <House size={15} />
            Home
          </Link>

          <ChevronRight size={15} />
          <span>My Profile</span>
        </div>

        <div className="profile-heading">
          <div>
            <span className="profile-eyebrow">YOUR ACCOUNT</span>

            <h1>
              My <span>Profile</span>
            </h1>

            <p>
              Manage your personal information and account settings.
            </p>
          </div>

          <Link href="/" className="profile-back-button">
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="profile-success-message">{message}</p>}

        <div className="profile-layout">
          <section className="profile-card">
            <div className="profile-card-top">
              <span className="profile-status">
                <span></span>
                Active Account
              </span>
            </div>

            <div className="profile-avatar">{initial}</div>

            <h2>{user.name}</h2>

            <p className="profile-user-email">{user.email}</p>

            <div className="profile-member-badge">
              <ShieldCheck size={16} />
              Foodie Member
            </div>

            <div className="profile-card-divider"></div>

            <Link href="/orders" className="profile-side-link">
              <span className="profile-side-icon">
                <Package size={19} />
              </span>

              <span>My Orders</span>
              <ChevronRight size={17} />
            </Link>

            <Link href="/" className="profile-side-link">
              <span className="profile-side-icon">
                <House size={19} />
              </span>

              <span>Continue to Order</span>
              <ChevronRight size={17} />
            </Link>

            <button
              className="profile-logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={18} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </section>

          <section className="profile-details">
            <div className="profile-details-heading">
              <div>
                <span className="profile-eyebrow">
                  ACCOUNT INFORMATION
                </span>

                <h2>Personal Details</h2>

                <p>Your registered account information.</p>
              </div>

              <div className="profile-details-icon">
                <UserRound size={24} />
              </div>
            </div>

            <div className="profile-info-box">
              <div className="profile-info-icon">
                <UserRound size={20} />
              </div>

              <div className="profile-info-content">
                <span>Full Name</span>

                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={80}
                    placeholder="Enter your name"
                  />
                ) : (
                  <strong>{user.name}</strong>
                )}
              </div>
            </div>

            <div className="profile-info-box">
              <div className="profile-info-icon">
                <Mail size={20} />
              </div>

              <div className="profile-info-content">
                <span>Email Address</span>
                <strong>{user.email}</strong>
              </div>
            </div>

            <div className="profile-info-box">
              <div className="profile-info-icon">
                <ShieldCheck size={20} />
              </div>

              <div className="profile-info-content">
                <span>Account Status</span>
                <strong className="profile-verified">Active</strong>
              </div>
            </div>

            <div className="profile-edit-actions">
              {editing ? (
                <>
                  <button
                    className="profile-save-button"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    className="profile-cancel-button"
                    onClick={() => {
                      setName(user.name);
                      setEditing(false);
                      setError("");
                    }}
                  >
                    <X size={17} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="profile-save-button"
                  onClick={() => {
                    setEditing(true);
                    setMessage("");
                  }}
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="profile-note">
              <ShieldCheck size={20} />

              <div>
                <strong>Your account is protected</strong>
                <p>
                  Your profile information is securely retrieved
                  and updated through your Foodie account.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

