"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, RefreshCw } from "lucide-react";
import "../admin.css";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    id: string;
  }[];
};

const statuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/orders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders");
      }

      setOrders(data.orders);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status");
      }

      await loadOrders();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Update failed"
      );
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <h2>FOODDIE<span>.</span></h2>
        <p className="sidebar-label">ADMIN PANEL</p>

        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/foods">Food Management</Link>
          <Link href="/admin/categories">Categories</Link>
          <Link href="/admin/orders" className="active">
            Orders
          </Link>
          <Link href="/admin/users">Users</Link>
        </nav>
      </aside>

      <section className="admin-dashboard">
        <div className="food-header">
          <div>
            <h1>Order Management</h1>
            <p>Manage and track customer orders.</p>
          </div>

          <button
            className="add-food-btn"
            onClick={loadOrders}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="order-summary">
          <div className="admin-stat-card">
            <ShoppingBag size={22} />
            <h2>{orders.length}</h2>
            <p>Total Orders</p>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="food-table-wrapper">
          {loading ? (
            <p className="order-message">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="order-message">No orders found.</p>
          ) : (
            <table className="food-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(-8)}</td>

                    <td>
                      <strong>{order.user.name}</strong>
                      <br />
                      <small>{order.user.email}</small>
                    </td>

                    <td>{order.items.length}</td>

                    <td>₹{Number(order.total).toFixed(2)}</td>

                    <td>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <select
                        className="order-status-select"
                        value={order.status}
                        onChange={(event) =>
                          updateStatus(order.id, event.target.value)
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}