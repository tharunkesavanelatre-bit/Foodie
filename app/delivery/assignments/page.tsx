"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  Clock,
  Bike,
  RefreshCw,
  Navigation,
} from "lucide-react";

import "./assignments.css";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Assignment = {
  id: string;
  status: string;
  assignedAt: string;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  order: {
    id: string;
    orderId: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    subtotal: number;
    delivery: number;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
  };
};

export default function DeliveryAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function loadAssignments() {
    try {
      setLoading(true);

      const response = await fetch("/api/delivery/assignments");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load deliveries.");
      }

      setAssignments(result.assignments || []);
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
    loadAssignments();
  }, []);

  async function updateStatus(id: string, status: string) {
    const confirmation =
      status === "PICKED_UP"
        ? "Confirm that you have picked up this order?"
        : "Confirm that this order has been delivered?";

    if (!window.confirm(confirmation)) return;

    try {
      setUpdatingId(id);
      setError("");

      const response = await fetch(`/api/delivery/assignments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update delivery.");
      }

      await loadAssignments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdatingId("");
    }
  }

  const activeCount = assignments.filter(
    (item) => item.status !== "DELIVERED"
  ).length;

  const deliveredCount = assignments.filter(
    (item) => item.status === "DELIVERED"
  ).length;

  if (loading) {
    return (
      <div className="assignments-loading">
        <Bike size={35} />
        <p>Loading your deliveries...</p>
      </div>
    );
  }

  return (
    <main className="assignments-page">
      <header className="assignments-header">
        <Link href="/delivery" className="assignments-back">
          <ArrowLeft size={18} />
          Dashboard
        </Link>

        <div className="assignments-brand">
          FOODDIE<span>.</span>
        </div>
      </header>

      <section className="assignments-hero">
        <div>
          <span className="assignments-eyebrow">
            DELIVERY MANAGEMENT
          </span>
          <h1>My Deliveries</h1>
          <p>Manage your assigned orders from pickup to delivery.</p>
        </div>

        <button
          className="assignments-refresh"
          onClick={loadAssignments}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </section>

      <section className="assignments-summary">
        <div>
          <Package size={22} />
          <span>All Deliveries</span>
          <strong>{assignments.length}</strong>
        </div>

        <div>
          <Clock size={22} />
          <span>Active Deliveries</span>
          <strong>{activeCount}</strong>
        </div>

        <div>
          <CheckCircle2 size={22} />
          <span>Completed</span>
          <strong>{deliveredCount}</strong>
        </div>
      </section>

      {error && (
        <div className="assignments-error">
          {error}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="assignments-empty">
          <Package size={48} />
          <h2>No deliveries yet</h2>
          <p>Your assigned orders will appear here.</p>

          <Link href="/delivery">
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <section className="assignments-list">
          {assignments.map((assignment) => {
            const order = assignment.order;
            const isAssigned = assignment.status === "ASSIGNED";
            const isPickedUp = assignment.status === "PICKED_UP";
            const isDelivered = assignment.status === "DELIVERED";
            const isUpdating = updatingId === assignment.id;

            return (
              <article
                className="assignment-card"
                key={assignment.id}
              >
                <div className="assignment-card-header">
                  <div>
                    <span className="assignment-order-label">
                      ORDER ID
                    </span>
                    <h2>#{order.orderId}</h2>
                  </div>

                  <span
                    className={`assignment-status ${assignment.status.toLowerCase()}`}
                  >
                    {assignment.status.replace("_", " ")}
                  </span>
                </div>

                <div className="assignment-customer">
                  <div className="assignment-icon">
                    <Package size={21} />
                  </div>

                  <div>
                    <span>Customer</span>
                    <strong>{order.name}</strong>
                  </div>
                </div>

                <div className="assignment-contact">
                  <Phone size={17} />
                  <a href={`tel:${order.phone}`}>
                    {order.phone}
                  </a>
                </div>

                <div className="assignment-address">
                  <MapPin size={19} />
                  <div>
                    <strong>Delivery Address</strong>
                    <p>
                      {order.address}, {order.city} - {order.pincode}
                    </p>
                  </div>
                </div>

                <div className="assignment-items">
                  <h3>Order Items</h3>

                  {order.items.map((item) => (
                    <div className="assignment-item" key={item.id}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <strong>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="assignment-total">
                  <span>Order Total</span>
                  <strong>
                    ₹{order.total.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="assignment-timeline">
                  <div className={isAssigned || isPickedUp || isDelivered ? "completed" : ""}>
                    <span>1</span>
                    <p>Assigned</p>
                  </div>

                  <div className={isPickedUp || isDelivered ? "completed" : ""}>
                    <span>2</span>
                    <p>Picked Up</p>
                  </div>

                  <div className={isDelivered ? "completed" : ""}>
                    <span>3</span>
                    <p>Delivered</p>
                  </div>
                </div>

                <div className="assignment-action">
                  {isAssigned && (
                    <button
                      onClick={() =>
                        updateStatus(assignment.id, "PICKED_UP")
                      }
                      disabled={isUpdating}
                      className="assignment-pickup-button"
                    >
                      <Bike size={18} />
                      {isUpdating ? "Updating..." : "Confirm Pickup"}
                    </button>
                  )}

                  {isPickedUp && (
                    <button
                      onClick={() =>
                        updateStatus(assignment.id, "DELIVERED")
                      }
                      disabled={isUpdating}
                      className="assignment-delivered-button"
                    >
                      <CheckCircle2 size={18} />
                      {isUpdating ? "Updating..." : "Mark as Delivered"}
                    </button>
                  )}

                  {isDelivered && (
                    <div className="assignment-completed">
                      <CheckCircle2 size={19} />
                      Successfully Delivered
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}