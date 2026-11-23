"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Store,
  Save,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import "./profile.css";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  status: string;
  isOpen: boolean;
};

const initialForm = {
  name: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  pincode: "",
};

export default function RestaurantProfilePage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isRegistration = !restaurant;
  const isApproved = restaurant?.status === "APPROVED";
  const isPending = restaurant?.status === "PENDING";
  const isRejected = restaurant?.status === "REJECTED";

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/restaurant/profile", {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 404) {
        setRestaurant(null);
        setForm(initialForm);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load profile.");
      }

      setRestaurant(data.restaurant);

      setForm({
        name: data.restaurant.name || "",
        description: data.restaurant.description || "",
        phone: data.restaurant.phone || "",
        email: data.restaurant.email || "",
        address: data.restaurant.address || "",
        city: data.restaurant.city || "",
        pincode: data.restaurant.pincode || "",
      });
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

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/restaurant/profile", {
        method: isRegistration ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save restaurant details.");
      }

      setRestaurant(data.restaurant);

      setForm({
        name: data.restaurant.name || "",
        description: data.restaurant.description || "",
        phone: data.restaurant.phone || "",
        email: data.restaurant.email || "",
        address: data.restaurant.address || "",
        city: data.restaurant.city || "",
        pincode: data.restaurant.pincode || "",
      });

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
    if (!restaurant || !isApproved) return;

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

  return (
    <main className="restaurant-profile-page">
      <header className="restaurant-profile-header">
        <div>
          <span>RESTAURANT MANAGEMENT</span>
          <h1>{isRegistration ? "Register Your Restaurant" : "Restaurant Profile"}</h1>
          <p>
            {isRegistration
              ? "Submit your restaurant details to join Foodie."
              : "Manage your restaurant information and availability."}
          </p>
        </div>

        <div className="restaurant-profile-icon">
          <Store size={30} />
        </div>
      </header>

      {restaurant && (
        <section className="restaurant-profile-status">
          <div>
            <span className="restaurant-profile-status-label">
              RESTAURANT STATUS
            </span>

            <h2>{restaurant.name}</h2>

            <p>
              {isApproved
                ? restaurant.isOpen
                  ? "Your restaurant is currently accepting orders."
                  : "Your restaurant is currently closed."
                : isPending
                  ? "Your application is waiting for admin approval."
                  : "Your restaurant application was rejected."}
            </p>
          </div>

          {isApproved && (
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
          )}
        </section>
      )}

      {isPending && (
        <div className="restaurant-profile-success">
          <Clock size={20} />
          Your registration has been submitted. Please wait for admin approval.
        </div>
      )}

      {isApproved && (
        <div className="restaurant-profile-success">
          <CheckCircle2 size={20} />
          Your restaurant has been approved.
        </div>
      )}

      {isRejected && (
        <div className="restaurant-profile-error">
          <XCircle size={20} />
          Your restaurant application was rejected. Please contact the admin
          team for assistance.
        </div>
      )}

      {message && (
        <div className="restaurant-profile-success">{message}</div>
      )}

      {error && (
        <div className="restaurant-profile-error">{error}</div>
      )}

      <form className="restaurant-profile-form" onSubmit={saveProfile}>
        <div className="restaurant-profile-section-heading">
          <div>
            <h2>Basic Information</h2>
            <p>
              {isRegistration
                ? "Enter your restaurant information for registration."
                : "Keep your restaurant details up to date."}
            </p>
          </div>

          <Building2 size={23} />
        </div>

        <fieldset
          disabled={saving || (!isRegistration && !isApproved)}
          style={{ border: "none", padding: 0, margin: 0 }}
        >
          <div className="restaurant-profile-grid">
            <label>
              Restaurant Name
              <input
                value={form.name}
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
                  value={form.email}
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
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </span>
            </label>

            <label>
              City
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />
            </label>

            <label className="restaurant-profile-full">
              Description
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
              />
            </label>

            <label className="restaurant-profile-full">
              <span className="restaurant-profile-label-icon">
                <MapPin size={16} />
                Restaurant Address
              </span>

              <input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                required
              />
            </label>

            <label>
              Pincode
              <input
                value={form.pincode}
                onChange={(e) => updateField("pincode", e.target.value)}
                required
              />
            </label>
          </div>
        </fieldset>

        <div className="restaurant-profile-footer">
          <span>
            {restaurant
              ? <>Approval Status: <strong>{restaurant.status}</strong></>
              : "Registration: New Application"}
          </span>

          {(isRegistration || isApproved) && (
            <button type="submit" disabled={saving}>
              <Save size={17} />
              {saving
                ? "Submitting..."
                : isRegistration
                  ? "Submit Registration"
                  : "Save Changes"}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}