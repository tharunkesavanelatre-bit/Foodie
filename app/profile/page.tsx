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
} from "lucide-react";

import "./profile.css";

interface UserSession {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(null);
  const [checking, setChecking] = useState(true);

  // ==========================================
  // LOAD USER SESSION
  // ==========================================

  useEffect(() => {
    const storedUser = localStorage.getItem("foodie_session");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser.name || !parsedUser.email) {
        localStorage.removeItem("foodie_session");
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
      setChecking(false);
    } catch {
      localStorage.removeItem("foodie_session");
      router.replace("/login");
    }
  }, [router]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("foodie_session");
    router.replace("/login");
  };

  if (checking || !user) {
    return (
      <div className="profile-loading">
        <div className="profile-loader"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <main className="profile-page">

      {/* BACKGROUND DECORATION */}
      <div className="profile-decoration profile-decoration-one"></div>
      <div className="profile-decoration profile-decoration-two"></div>

      <div className="profile-container">

        {/* BREADCRUMB */}
        <div className="profile-breadcrumb">
          <Link href="/home">
            <House size={15} />
            Home
          </Link>

          <ChevronRight size={15} />

          <span>My Profile</span>
        </div>

        {/* PAGE HEADING */}
        <div className="profile-heading">
          <div>
            <span className="profile-eyebrow">
              YOUR ACCOUNT
            </span>

            <h1>
              My <span>Profile</span>
            </h1>

            <p>
              Manage your personal information and account settings.
            </p>
          </div>

          <Link href="/home" className="profile-back-button">
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>

        {/* PROFILE CONTENT */}
        <div className="profile-layout">

          {/* LEFT PROFILE CARD */}
          <section className="profile-card">

            <div className="profile-card-top">
              <span className="profile-status">
                <span></span>
                Active Account
              </span>
            </div>

            <div className="profile-avatar">
              {initial}
            </div>

            <h2>{user.name}</h2>

            <p className="profile-user-email">
              {user.email}
            </p>

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

            <Link href="/home" className="profile-side-link">
              <span className="profile-side-icon">
                <House size={19} />
              </span>

              <span>Continue to Order</span>

              <ChevronRight size={17} />
            </Link>

            <button
              className="profile-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </button>

          </section>

          {/* RIGHT ACCOUNT DETAILS */}
          <section className="profile-details">

            <div className="profile-details-heading">
              <div>
                <span className="profile-eyebrow">
                  ACCOUNT INFORMATION
                </span>

                <h2>Personal Details</h2>

                <p>
                  Your registered account information.
                </p>
              </div>

              <div className="profile-details-icon">
                <UserRound size={24} />
              </div>
            </div>

            {/* NAME */}
            <div className="profile-info-box">
              <div className="profile-info-icon">
                <UserRound size={20} />
              </div>

              <div className="profile-info-content">
                <span>Full Name</span>
                <strong>{user.name}</strong>
              </div>
            </div>

            {/* EMAIL */}
            <div className="profile-info-box">
              <div className="profile-info-icon">
                <Mail size={20} />
              </div>

              <div className="profile-info-content">
                <span>Email Address</span>
                <strong>{user.email}</strong>
              </div>
            </div>

            {/* ACCOUNT STATUS */}
            <div className="profile-info-box">
              <div className="profile-info-icon">
                <ShieldCheck size={20} />
              </div>

              <div className="profile-info-content">
                <span>Account Status</span>
                <strong className="profile-verified">
                  Active
                </strong>
              </div>
            </div>

            {/* INFORMATION NOTE */}
            <div className="profile-note">
              <ShieldCheck size={20} />

              <div>
                <strong>Your account is protected</strong>
                <p>
                  Your profile information is stored locally
                  in this demo application.
                </p>
              </div>
            </div>

          </section>

        </div>

      </div>
    </main>
  );
}