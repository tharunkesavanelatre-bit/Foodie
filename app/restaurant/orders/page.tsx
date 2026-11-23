"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

import "./orders.css";

type Order = {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  user: {
    name: string;
    email: string;
  };
};

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);

      const response = await fetch("/api/restaurant/orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(data.orders);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateOrder(orderId: string, status: string) {
    const action = status === "Processing" ? "accept" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this order?`)) {
      return;
    }

    try {
      setUpdating(orderId);
      setMessage("");

      const response = await fetch("/api/restaurant/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update order.");
      }

      await loadOrders();
      setMessage(data.message);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Update failed."
      );
    } finally {
      setUpdating("");
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main className="restaurant-orders-page">
      <header className="restaurant-orders-header">
        <Link href="/restaurant" className="restaurant-back-link">
          <ArrowLeft size={19} />
          Dashboard
        </Link>

        <h2>FOODDIE<span>.</span></h2>

        <button onClick={loadOrders}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className="restaurant-orders-content">
        <div className="restaurant-orders-title">
          <div>
            <p>ORDER MANAGEMENT</p>
            <h1>Restaurant Orders</h1>
            <span>Manage and track your customer orders.</span>
          </div>

          <div className="restaurant-orders-count">
            <ShoppingBag size={22} />
            {orders.length} Orders
          </div>
        </div>

        {message && (
          <div className="restaurant-orders-message">{message}</div>
        )}

        {loading ? (
          <div className="restaurant-orders-empty">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="restaurant-orders-empty">
            <ShoppingBag size={40} />
            <h3>No orders found</h3>
            <p>Customer orders will appear here.</p>
          </div>
        ) : (
          <div className="restaurant-orders-list">
            {orders.map((order) => (
              <article className="restaurant-order-card" key={order.id}>
                <div className="restaurant-order-top">
                  <div>
                    <span>ORDER ID</span>
                    <h3>{order.orderId}</h3>
                  </div>

                  <span className="restaurant-order-badge">
                    {order.status}
                  </span>
                </div>

                <div className="restaurant-order-customer">
                  <p>
                    <strong>Customer:</strong>{" "}
                    {order.customerName || order.user?.name || "Customer"}
                  </p>

                  <p>
                    <strong>Email:</strong> {order.user?.email || "N/A"}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="restaurant-order-items">
                  <h4>Order Items</h4>

                  {order.items.map((item, index) => (
                    <div className="restaurant-order-item" key={index}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <strong>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="restaurant-order-bottom">
                  <strong>
                    Total: ₹{order.total.toLocaleString("en-IN")}
                  </strong>

                  {order.status === "Pending" && (
                    <div className="restaurant-order-actions">
                      <button
                        className="restaurant-accept-button"
                        disabled={updating === order.id}
                        onClick={() =>
                          updateOrder(order.id, "Processing")
                        }
                      >
                        <Check size={17} />
                        Accept
                      </button>

                      <button
                        className="restaurant-reject-button"
                        disabled={updating === order.id}
                        onClick={() =>
                          updateOrder(order.id, "Cancelled")
                        }
                      >
                        <X size={17} />
                        Reject
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
