"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Utensils,
  Tags,
  ShoppingBag,
  Users,
} from "lucide-react";

import "./admin.css";

type DashboardData = {
  name: string;
  email: string;
  statistics: {
    users: number;
    orders: number;
    pendingOrders: number;
    revenue: number;
  };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const result = await response.json();

        setData({
          name: result.admin.name,
          email: result.admin.email,
          statistics: result.statistics,
        });
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return null;

  const cards = [
    { title: "Total Users", value: data.statistics.users },
    { title: "Total Orders", value: data.statistics.orders },
    { title: "Pending Orders", value: data.statistics.pendingOrders },
    {
      title: "Total Revenue",
      value: `₹${data.statistics.revenue.toLocaleString("en-IN")}`,
    },
  ];

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <h2>FOODDIE<span>.</span></h2>
        <p className="sidebar-label">ADMIN PANEL</p>

        <nav>
          <Link href="/admin" className="active">
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link href="/admin/foods">
            <Utensils size={19} />
            Food Management
          </Link>

          <Link href="/admin/categories">
            <Tags size={19} />
            Categories
          </Link>

          <Link href="/admin/orders">
            <ShoppingBag size={19} />
            Orders
          </Link>

          <Link href="/admin/users">
            <Users size={19} />
            Users
          </Link>
        </nav>
      </aside>

      <section className="admin-dashboard">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, {data.name}!</p>
        <p>{data.email}</p>

        <section className="admin-stats">
          {cards.map((card) => (
            <div className="admin-stat-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.value}</p>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}