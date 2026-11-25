"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bike,
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  RefreshCw,
  Navigation,
  UserRound,
} from "lucide-react";

import "./delivery.css";

type Assignment = {
  id: string;
  status: string;
  order: {
    id: string;
    orderId: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    total: number;
    status: string;
    createdAt: string;
    items: {
      name: string;
      quantity: number;
    }[];
  };
};

type DashboardData = {
  partner: {
    id: string;
    phone: string;
    vehicleType: string;
    vehicleNumber: string;
    status: string;
    isAvailable: boolean;
  };
  statistics: {
    total: number;
    assigned: number;
    pickedUp: number;
    delivered: number;
  };
  assignments: Assignment[];
};

export default function DeliveryDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  async function loadDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/delivery/dashboard");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load dashboard.");
      }

      setData(result);
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
    loadDashboard();
  }, []);

  async function toggleAvailability() {
    if (!data) return;

    try {
      setUpdating(true);
      setError("");

      const response = await fetch("/api/delivery/availability", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAvailable: !data.partner.isAvailable,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update availability.");
      }

      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <div className="delivery-loading">Loading dashboard...</div>;
  }

  if (error && !data) {
    return (
      <div className="delivery-loading">
        <p>{error}</p>
        <button onClick={loadDashboard}>Try Again</button>
      </div>
    );
  }

  if (!data) return null;

  const stats = data.statistics;

  const cards = [
    { title: "Total Deliveries", value: stats.total, icon: Package },
    { title: "Assigned", value: stats.assigned, icon: Clock },
    { title: "Picked Up", value: stats.pickedUp, icon: Bike },
    { title: "Delivered", value: stats.delivered, icon: CheckCircle },
  ];

  return (
    <main className="delivery-dashboard">
      <header className="delivery-header">
        <div className="delivery-brand">
          <Bike size={28} />
          <span>Foodie<span>.</span></span>
        </div>

        <nav className="delivery-navigation">
          <Link href="/delivery" className="delivery-nav-link">
            Dashboard
          </Link>

          <Link href="/delivery/assignments" className="delivery-nav-link">
            My Deliveries
          </Link>

          <Link href="/delivery/profile" className="delivery-nav-link">
            <UserRound size={17} />
            Profile
          </Link>
        </nav>
      </header>

      <section className="delivery-welcome">
        <div>
          <span>DELIVERY PARTNER PORTAL</span>
          <h1>Welcome Back!</h1>
          <p>Manage your deliveries and track your daily performance.</p>
        </div>

        <div className="delivery-availability">
          <span className={data.partner.isAvailable ? "online" : "offline"}>
            {data.partner.isAvailable ? "You're Online" : "You're Offline"}
          </span>

          <button
            onClick={toggleAvailability}
            disabled={updating}
            className={data.partner.isAvailable ? "go-offline" : "go-online"}
          >
            {updating
              ? "Updating..."
              : data.partner.isAvailable
                ? "Go Offline"
                : "Go Online"}
          </button>
        </div>
      </section>

      {error && <div className="delivery-error">{error}</div>}

      <section className="delivery-stats">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="delivery-stat-card" key={card.title}>
              <div className="delivery-stat-icon">
                <Icon size={23} />
              </div>
              <p>{card.title}</p>
              <h2>{card.value}</h2>
            </div>
          );
        })}
      </section>

      <section className="delivery-info-card">
        <div>
          <Bike size={22} />
          <span>Vehicle</span>
          <strong>{data.partner.vehicleType}</strong>
        </div>

        <div>
          <Navigation size={22} />
          <span>Vehicle Number</span>
          <strong>{data.partner.vehicleNumber}</strong>
        </div>

        <div>
          <Phone size={22} />
          <span>Contact Number</span>
          <strong>{data.partner.phone}</strong>
        </div>
      </section>

      <section className="delivery-recent">
        <div className="delivery-section-heading">
          <div>
            <h2>Recent Deliveries</h2>
            <p>Your assigned delivery orders</p>
          </div>

          <button onClick={loadDashboard}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {data.assignments.length === 0 ? (
          <div className="delivery-empty">
            <Package size={38} />
            <h3>No deliveries assigned</h3>
            <p>New delivery assignments will appear here.</p>
          </div>
        ) : (
          <div className="delivery-order-list">
            {data.assignments.slice(0, 5).map((assignment) => (
              <article className="delivery-order-card" key={assignment.id}>
                <div className="delivery-order-top">
                  <strong>#{assignment.order.orderId}</strong>

                  <span className={`delivery-order-status ${assignment.status.toLowerCase()}`}>
                    {assignment.status.replace("_", " ")}
                  </span>
                </div>

                <h3>{assignment.order.name}</h3>

                <p>
                  <MapPin size={16} />
                  {assignment.order.address}, {assignment.order.city} -{" "}
                  {assignment.order.pincode}
                </p>

                <div className="delivery-order-bottom">
                  <span>â‚¹{assignment.order.total.toLocaleString("en-IN")}</span>

                  <Link href="/delivery/assignments">
                    View Delivery â†’
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
