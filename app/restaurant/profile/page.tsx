"use client";

import { useEffect, useState } from "react";
import {
  Store,
  Save,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Building2,
} from "lucide-react";

import "./profile.css";

type Restaurant = {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  status: string;
  isOpen: boolean;
};

export default function RestaurantProfilePage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [form, setForm] = useState<Partial<Restaurant>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/restaurant/profile");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load profile.");
      }

      setRestaurant(data.restaurant);
      setForm(data.restaurant);
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

  function updateField(field: string, value: string | boolean) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/restaurant/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setRestaurant(data.restaurant);
      setForm(data.restaurant);
      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleRestaurant() {
    if (!restaurant) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/restaurant/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isOpen: !restaurant.isOpen,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status.");
      }

      setRestaurant(data.restaurant);
      setForm(data.restaurant);
      setMessage("Restaurant availability updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="restaurant-profile-loading">
        <RefreshCw size={28} />
        <p>Loading restaurant profile...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-profile-loading">
        <p>{error || "Restaurant profile not found."}</p>
        <button onClick={loadProfile}>Try Again</button>
      </div>
    );
  }

  return (
    <main className="restaurant-profile-page">
      <header className="restaurant-profile-header">
        <div>
          <span>RESTAURANT MANAGEMENT</span>
          <h1>Restaurant Profile</h1>
          <p>Manage your restaurant information and availability.</p>
        </div>

        <div className="restaurant-profile-icon">
          <Store size={30} />
        </div>
      </header>

      <section className="restaurant-profile-status">
        <div>
          <span className="restaurant-profile-status-label">
            RESTAURANT STATUS
          </span>
          <h2>{restaurant.name}</h2>
          <p>
            {restaurant.isOpen
              ? "Your restaurant is currently accepting orders."
              : "Your restaurant is currently closed."}
          </p>
        </div>

        <button
          className={
            restaurant.isOpen
              ? "restaurant-close-button"
              : "restaurant-open-button"
          }
          onClick={toggleRestaurant}
          disabled={saving}
        >
          {restaurant.isOpen ? "Close Restaurant" : "Open Restaurant"}
        </button>
      </section>

      {message && (
        <div className="restaurant-profile-success">{message}</div>
      )}

      {error && (
        <div className="restaurant-profile-error">{error}</div>
      )}

      <form
        className="restaurant-profile-form"
        onSubmit={saveProfile}
      >
        <div className="restaurant-profile-section-heading">
          <div>
            <h2>Basic Information</h2>
            <p>Keep your restaurant details up to date.</p>
          </div>
          <Building2 size={23} />
        </div>

        <div className="restaurant-profile-grid">
          <label>
            Restaurant Name
            <input
              value={form.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </label>

          <label>
            Email Address
            <span className="restaurant-profile-input-icon">
              <Mail size={17} />
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </span>
          </label>

          <label>
            Phone Number
            <span className="restaurant-profile-input-icon">
              <Phone size={17} />
              <input
                value={form.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
            </span>
          </label>

          <label>
            City
            <input
              value={form.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              required
            />
          </label>

          <label className="restaurant-profile-full">
            Description
            <textarea
              value={form.description || ""}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              required
            />
          </label>

          <label className="restaurant-profile-full">
            <span className="restaurant-profile-label-icon">
              <MapPin size={16} />
              Restaurant Address
            </span>
            <input
              value={form.address || ""}
              onChange={(e) => updateField("address", e.target.value)}
              required
            />
          </label>

          <label>
            Pincode
            <input
              value={form.pincode || ""}
              onChange={(e) => updateField("pincode", e.target.value)}
              required
            />
          </label>
        </div>

        <div className="restaurant-profile-footer">
          <span>
            Approval Status: <strong>{restaurant.status}</strong>
          </span>

          <button type="submit" disabled={saving}>
            <Save size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}