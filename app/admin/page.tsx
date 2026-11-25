"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  CreditCard,
  Bike,
  Store,
  Users,
  TicketPercent,
} from "lucide-react";

import "./admin.css";

type DashboardData = {
  name: string;
  email: string;
  role: string;
  permissions: string[];

  statistics: {
    users: number;
    orders: number;
    pendingOrders: number;
    revenue: number;
    totalPayments: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    collectedAmount: number;
  };
};

const navigation = [
  {
    title: "Food Management",
    href: "/admin/foods",
    permission: "foods:manage",
    icon: Utensils,
  },
  {
    title: "Restaurants",
    href: "/admin/restaurants",
    permission: "restaurants:manage",
    icon: Store,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    permission: "orders:manage",
    icon: ShoppingBag,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    permission: "customers:manage",
    icon: Users,
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    permission: "coupons:manage",
    icon: TicketPercent,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    permission: "payments:manage",
    icon: CreditCard,
  },
  {
    title: "Delivery Partners",
    href: "/admin/delivery-partners",
    permission: "delivery-partners:manage",
    icon: Bike,
  },
];

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
          role: result.admin.role,
          permissions: result.permissions,
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

  const hasPermission = (permission: string) =>
    data.permissions.includes(permission);

  const cards = [
    ...(hasPermission("customers:manage")
      ? [{ title: "Total Users", value: data.statistics.users }]
      : []),

    ...(hasPermission("orders:manage")
      ? [
          { title: "Total Orders", value: data.statistics.orders },
          { title: "Pending Orders", value: data.statistics.pendingOrders },
        ]
      : []),

    ...(hasPermission("payments:manage")
      ? [
          {
            title: "Total Revenue",
            value: `â‚¹${data.statistics.revenue.toLocaleString("en-IN")}`,
          },
          {
            title: "Total Payments",
            value: data.statistics.totalPayments,
          },
          {
            title: "Successful Payments",
            value: data.statistics.successfulPayments,
          },
          {
            title: "Pending Payments",
            value: data.statistics.pendingPayments,
          },
          {
            title: "Failed Payments",
            value: data.statistics.failedPayments,
          },
          {
            title: "Collected Amount",
            value: `â‚¹${data.statistics.collectedAmount.toLocaleString("en-IN")}`,
          },
        ]
      : []),
  ];

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <h2>
          Foodie<span>.</span>
        </h2>

        <p className="sidebar-label">ADMIN PANEL</p>

        <nav>
          <Link href="/admin" className="active">
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          {navigation.map((item) => {
            if (!hasPermission(item.permission)) return null;

            const Icon = item.icon;

            return (
              <Link href={item.href} key={item.href}>
                <Icon size={19} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-user">
          <p>{data.name}</p>
          <span>{data.role.replaceAll("_", " ")}</span>
        </div>
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
