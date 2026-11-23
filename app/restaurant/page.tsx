"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChefHat,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  RefreshCw,
  Utensils,
  UserRound,
} from "lucide-react";

import "./restaurant.css";

type DashboardData = {
  restaurant: {
    id: string;
    name: string;
    status: string;
    isOpen: boolean;
  };
  statistics: {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
  };
  recentOrders: {
    id: string;
    orderId: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
};

export default function RestaurantDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/restaurant/dashboard");
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

  if (loading) {
    return <div className="restaurant-loading">Loading dashboard...</div>;
  }

  if (error || !data) {
    return (
      <div className="restaurant-loading">
        <p>{error || "Dashboard unavailable."}</p>
        <button onClick={loadDashboard}>Try Again</button>
      </div>
    );
  }

  const stats = data.statistics;

  const cards = [
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingBag },
    { title: "Pending Orders", value: stats.pendingOrders, icon: Clock },
    { title: "Processing", value: stats.processingOrders, icon: RefreshCw },
    { title: "Delivered", value: stats.deliveredOrders, icon: CheckCircle },
    { title: "Cancelled", value: stats.cancelledOrders, icon: XCircle },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
  ];

  return (
    <main className="restaurant-dashboard">
      <header className="restaurant-header">
        <div className="restaurant-brand">
          <ChefHat size={28} />
          <span>FOODDIE<span>.</span></span>
        </div>

        <nav className="restaurant-header-info">
          <Link href="/restaurant/orders" className="restaurant-orders-link">
            <ShoppingBag size={18} />
            Orders
          </Link>

          <Link href="/restaurant/menu" className="restaurant-orders-link">
            <Utensils size={18} />
            Menu
          </Link>

          <Link href="/restaurant/profile" className="restaurant-orders-link">
            <UserRound size={18} />
            Profile
          </Link>

          <span>{data.restaurant.name}</span>

          <span className="restaurant-approved">Approved</span>

          <span
            className={
              data.restaurant.isOpen
                ? "restaurant-open-indicator"
                : "restaurant-closed-indicator"
            }
          >
            {data.restaurant.isOpen ? "Open" : "Closed"}
          </span>
        </nav>
      </header>

      <section className="restaurant-welcome">
        <div>
          <p>RESTAURANT OVERVIEW</p>
          <h1>Welcome, {data.restaurant.name}!</h1>
          <span>Manage your restaurant and track your orders.</span>
        </div>

        <button onClick={loadDashboard}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </section>

      <section className="restaurant-stats">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="restaurant-stat-card" key={card.title}>
              <div className="restaurant-stat-icon">
                <Icon size={22} />
              </div>
              <p>{card.title}</p>
              <h2>{card.value}</h2>
            </div>
          );
        })}
      </section>

      <section className="restaurant-recent">
        <div className="restaurant-section-heading">
          <div>
            <h2>Recent Orders</h2>
            <p>Your latest customer orders</p>
          </div>

          <Link href="/restaurant/orders" className="restaurant-view-orders">
            View All Orders →
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="restaurant-empty">
            <ShoppingBag size={35} />
            <h3>No orders yet</h3>
            <p>New customer orders will appear here.</p>
          </div>
        ) : (
          <div className="restaurant-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderId}</td>
                    <td>{order.customerName}</td>
                    <td>₹{order.total.toLocaleString("en-IN")}</td>
                    <td>
                      <span className="restaurant-order-status">
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}