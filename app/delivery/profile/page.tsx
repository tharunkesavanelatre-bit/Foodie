"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  Bike,
  Save,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import "./profile.css";

type PartnerProfile = {
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  status: string;
  isAvailable: boolean;
  user: {
    name: string;
    email: string;
  };
};

export default function DeliveryProfilePage() {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [form, setForm] = useState({
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);

      const response = await fetch("/api/delivery/profile");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load profile.");
      }

      const partner = result.partner as PartnerProfile;

      setProfile(partner);
      setForm({
        phone: partner.phone || "",
        vehicleType: partner.vehicleType || "",
        vehicleNumber: partner.vehicleNumber || "",
      });

      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/delivery/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update profile.");
      }

      setSuccess("Your profile has been updated successfully.");
      await loadProfile();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="delivery-profile-loading">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="delivery-profile-loading">
        <p>{error || "Profile not found."}</p>
        <button onClick={loadProfile}>Try Again</button>
      </div>
    );
  }

  return (
    <main className="delivery-profile-page">
      <header className="delivery-profile-header">
        <Link href="/delivery">
          <ArrowLeft size={18} />
          Dashboard
        </Link>

        <strong>
          FOODDIE<span>.</span>
        </strong>
      </header>

      <section className="delivery-profile-heading">
        <div>
          <span>ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>Manage your personal and vehicle information.</p>
        </div>

        <div className="delivery-profile-badge">
          <ShieldCheck size={18} />
          {profile.status}
        </div>
      </section>

      <section className="delivery-profile-layout">
        <aside className="delivery-profile-sidebar">
          <div className="delivery-profile-avatar">
            <UserRound size={38} />
          </div>

          <h2>{profile.user.name}</h2>
          <p>{profile.user.email}</p>

          <div className="delivery-profile-divider" />

          <div className="delivery-profile-account-info">
            <span>Account Status</span>
            <strong className="delivery-approved">
              <CheckCircle2 size={16} />
              {profile.status}
            </strong>
          </div>

          <div className="delivery-profile-account-info">
            <span>Availability</span>
            <strong className={profile.isAvailable ? "delivery-online" : "delivery-offline"}>
              {profile.isAvailable ? "Online" : "Offline"}
            </strong>
          </div>

          <Link href="/delivery/assignments" className="delivery-profile-link">
            <Bike size={17} />
            My Deliveries →
          </Link>
        </aside>

        <section className="delivery-profile-form-card">
          <div className="delivery-profile-form-heading">
            <h2>Personal & Vehicle Details</h2>
            <p>Update the contact and vehicle details associated with your account.</p>
          </div>

          {error && <div className="delivery-profile-error">{error}</div>}
          {success && <div className="delivery-profile-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="delivery-profile-readonly">
              <label>Full Name</label>
              <div>
                <UserRound size={18} />
                <span>{profile.user.name}</span>
              </div>
              <small>Name is managed through your account.</small>
            </div>

            <div className="delivery-profile-readonly">
              <label>Email Address</label>
              <div>
                <Mail size={18} />
                <span>{profile.user.email}</span>
              </div>
            </div>

            <div className="delivery-profile-field">
              <label htmlFor="phone">Contact Number</label>
              <div className="delivery-profile-input">
                <Phone size={18} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  required
                />
              </div>
            </div>

            <div className="delivery-profile-field">
              <label htmlFor="vehicleType">Vehicle Type</label>
              <div className="delivery-profile-input">
                <Bike size={18} />
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select vehicle type</option>
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Electric Bike">Electric Bike</option>
                  <option value="Car">Car</option>
                </select>
              </div>
            </div>

            <div className="delivery-profile-field">
              <label htmlFor="vehicleNumber">Vehicle Number</label>
              <div className="delivery-profile-input">
                <NavigationIcon />
                <input
                  id="vehicleNumber"
                  name="vehicleNumber"
                  type="text"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  placeholder="Enter vehicle registration number"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="delivery-profile-save"
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

function NavigationIcon() {
  return <Bike size={18} />;
}