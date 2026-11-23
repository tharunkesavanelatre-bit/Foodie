"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  UserRound,
  Utensils,
} from "lucide-react";

import "./restaurants.css";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  status: string;
  isOpen: boolean;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
};

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/restaurants", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load restaurants.");
      }

      setRestaurants(result.restaurants || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const statistics = useMemo(
    () => ({
      total: restaurants.length,
      pending: restaurants.filter((item) => item.status === "PENDING").length,
      approved: restaurants.filter((item) => item.status === "APPROVED").length,
      rejected: restaurants.filter((item) => item.status === "REJECTED").length,
    }),
    [restaurants]
  );

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesStatus =
        filter === "ALL" || restaurant.status === filter;

      const matchesSearch =
        !query ||
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.email.toLowerCase().includes(query) ||
        restaurant.owner.name.toLowerCase().includes(query) ||
        restaurant.owner.email.toLowerCase().includes(query) ||
        restaurant.city.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [restaurants, search, filter]);

  async function updateStatus(
    restaurant: Restaurant,
    status: "APPROVED" | "REJECTED"
  ) {
    const action = status === "APPROVED" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} ${restaurant.name}?`)) {
      return;
    }

    setUpdatingId(restaurant.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/restaurants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: restaurant.id,
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update restaurant.");
      }

      setMessage(result.message || "Restaurant status updated.");
      await fetchRestaurants();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="restaurant-admin-page">
      <header className="restaurant-admin-header">
        <div>
          <Link href="/admin" className="restaurant-admin-back">
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="restaurant-admin-heading">
            <div className="restaurant-admin-heading-icon">
              <Store size={25} />
            </div>

            <div>
              <h1>Restaurant Management</h1>
              <p>Review applications and manage restaurant approvals.</p>
            </div>
          </div>
        </div>

        <button
          className="restaurant-admin-refresh"
          onClick={fetchRestaurants}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "restaurant-spinning" : ""} />
          Refresh
        </button>
      </header>

      <section className="restaurant-admin-stats">
        <div className="restaurant-admin-stat">
          <span className="restaurant-stat-icon total">
            <Store size={20} />
          </span>
          <div>
            <p>Total Restaurants</p>
            <h2>{statistics.total}</h2>
          </div>
        </div>

        <div className="restaurant-admin-stat">
          <span className="restaurant-stat-icon pending">
            <Clock size={20} />
          </span>
          <div>
            <p>Pending Applications</p>
            <h2>{statistics.pending}</h2>
          </div>
        </div>

        <div className="restaurant-admin-stat">
          <span className="restaurant-stat-icon approved">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p>Approved</p>
            <h2>{statistics.approved}</h2>
          </div>
        </div>

        <div className="restaurant-admin-stat">
          <span className="restaurant-stat-icon rejected">
            <XCircle size={20} />
          </span>
          <div>
            <p>Rejected</p>
            <h2>{statistics.rejected}</h2>
          </div>
        </div>
      </section>

      <section className="restaurant-admin-content">
        <div className="restaurant-admin-toolbar">
          <div>
            <h2>Restaurant Applications</h2>
            <p>Review restaurant details and application status.</p>
          </div>

          <div className="restaurant-admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search restaurants, owners, cities..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="restaurant-admin-filters">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as FilterStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={filter === status ? "selected" : ""}
              >
                {status === "ALL"
                  ? "All Restaurants"
                  : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            )
          )}
        </div>

        {error && (
          <div className="restaurant-admin-alert error">
            {error}
          </div>
        )}

        {message && (
          <div className="restaurant-admin-alert success">
            {message}
          </div>
        )}

        {loading ? (
          <div className="restaurant-admin-empty">
            <RefreshCw size={25} className="restaurant-spinning" />
            <p>Loading restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="restaurant-admin-empty">
            <Store size={35} />
            <h3>No restaurants found</h3>
            <p>Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="restaurant-admin-list">
            {filteredRestaurants.map((restaurant) => (
              <article
                className="restaurant-admin-card"
                key={restaurant.id}
              >
                <div className="restaurant-card-top">
                  <div className="restaurant-card-title">
                    <div className="restaurant-card-icon">
                      <Utensils size={23} />
                    </div>

                    <div>
                      <h3>{restaurant.name}</h3>
                      <span className={`restaurant-status ${restaurant.status.toLowerCase()}`}>
                        {restaurant.status}
                      </span>
                    </div>
                  </div>

                  <span className="restaurant-card-date">
                    Applied {formatDate(restaurant.createdAt)}
                  </span>
                </div>

                {restaurant.description && (
                  <p className="restaurant-card-description">
                    {restaurant.description}
                  </p>
                )}

                <div className="restaurant-card-details">
                  <div>
                    <UserRound size={16} />
                    <span>{restaurant.owner.name}</span>
                  </div>

                  <div>
                    <Mail size={16} />
                    <span>{restaurant.email}</span>
                  </div>

                  <div>
                    <Phone size={16} />
                    <span>{restaurant.phone}</span>
                  </div>

                  <div>
                    <MapPin size={16} />
                    <span>
                      {restaurant.address}, {restaurant.city} - {restaurant.pincode}
                    </span>
                  </div>
                </div>

                <div className="restaurant-card-footer">
                  <span className={`restaurant-open-status ${restaurant.isOpen ? "open" : "closed"}`}>
                    {restaurant.isOpen ? "Currently Open" : "Currently Closed"}
                  </span>

                  {restaurant.status === "PENDING" && (
                    <div className="restaurant-card-actions">
                      <button
                        className="restaurant-reject-button"
                        onClick={() => updateStatus(restaurant, "REJECTED")}
                        disabled={updatingId === restaurant.id}
                      >
                        Reject
                      </button>

                      <button
                        className="restaurant-approve-button"
                        onClick={() => updateStatus(restaurant, "APPROVED")}
                        disabled={updatingId === restaurant.id}
                      >
                        <CheckCircle2 size={16} />
                        {updatingId === restaurant.id ? "Updating..." : "Approve"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}