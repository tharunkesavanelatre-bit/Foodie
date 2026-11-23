"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ShoppingBag,
  CalendarDays,
  Eye,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

import "./customers.css";

type Customer = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  totalOrders: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/customers", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load customers.");
      }

      setCustomers(result.customers || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(value) ||
        customer.email.toLowerCase().includes(value)
    );
  }, [customers, search]);

  const totalOrders = customers.reduce(
    (total, customer) => total + customer.totalOrders,
    0
  );

  const activeCustomers = customers.filter(
    (customer) => customer.totalOrders > 0
  ).length;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="customers-page">
      <header className="customers-header">
        <div>
          <Link href="/admin" className="customers-back">
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <span className="customers-eyebrow">ADMIN MANAGEMENT</span>
          <h1>Customer Management</h1>
          <p>View and monitor all registered FOODDIE customers.</p>
        </div>

        <button
          className="customers-refresh"
          onClick={loadCustomers}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className="customers-stats">
        <div className="customers-stat-card">
          <div className="customers-stat-icon">
            <Users size={22} />
          </div>
          <div>
            <span>Total Customers</span>
            <h2>{customers.length}</h2>
          </div>
        </div>

        <div className="customers-stat-card">
          <div className="customers-stat-icon">
            <ShoppingBag size={22} />
          </div>
          <div>
            <span>Total Orders</span>
            <h2>{totalOrders}</h2>
          </div>
        </div>

        <div className="customers-stat-card">
          <div className="customers-stat-icon">
            <CalendarDays size={22} />
          </div>
          <div>
            <span>Customers With Orders</span>
            <h2>{activeCustomers}</h2>
          </div>
        </div>
      </section>

      <section className="customers-content">
        <div className="customers-content-heading">
          <div>
            <h2>Registered Customers</h2>
            <p>Customer accounts and their order activity</p>
          </div>

          <span className="customers-count">
            {filteredCustomers.length} Results
          </span>
        </div>

        <div className="customers-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="customers-state">
            <RefreshCw className="customers-spinner" size={28} />
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div className="customers-state customers-error">
            <p>{error}</p>
            <button onClick={loadCustomers}>Try Again</button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="customers-state">
            <Users size={36} />
            <h3>No customers found</h3>
            <p>
              {search
                ? "Try another search term."
                : "Registered customers will appear here."}
            </p>
          </div>
        ) : (
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email Address</th>
                  <th>Registration Date</th>
                  <th>Total Orders</th>
                  <th>Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-identity">
                        <div className="customer-avatar">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{customer.name}</strong>
                          <span>Customer</span>
                        </div>
                      </div>
                    </td>

                    <td>{customer.email}</td>

                    <td>
                      <span className="customer-date">
                        <CalendarDays size={15} />
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>

                    <td>
                      <span className="customer-orders">
                        {customer.totalOrders}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`customer-activity ${
                          customer.totalOrders > 0 ? "has-orders" : "no-orders"
                        }`}
                      >
                        {customer.totalOrders > 0
                          ? "Active"
                          : "No Orders"}
                      </span>
                    </td>

                    <td>
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="customer-view-button"
                      >
                        <Eye size={15} />
                        View Details
                      </Link>
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