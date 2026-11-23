"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  Receipt,
} from "lucide-react";
import "../admin.css";

type Payment = {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  status: string;
  transactionId: string | null;
  createdAt: string;
  paidAt: string | null;
  order: {
    orderId: string;
    status: string;
    user: {
      name: string;
      email: string;
    };
  };
};

const statuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPayments() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/payments", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load payments");
      }

      setPayments(data.payments || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const response = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update payment");
      }

      await loadPayments();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Payment update failed"
      );
    }
  }

  async function updateTransactionId(
    id: string,
    currentTransactionId: string | null
  ) {
    const transactionId = window.prompt(
      "Enter transaction ID:",
      currentTransactionId || ""
    );

    if (transactionId === null) return;

    try {
      const response = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          transactionId: transactionId.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update transaction ID");
      }

      await loadPayments();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Transaction update failed"
      );
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const paidCount = payments.filter(
    (payment) => payment.status === "PAID"
  ).length;

  const pendingCount = payments.filter(
    (payment) => payment.status === "PENDING"
  ).length;

  const failedCount = payments.filter(
    (payment) => payment.status === "FAILED"
  ).length;

  const refundedCount = payments.filter(
    (payment) => payment.status === "REFUNDED"
  ).length;

  const collectedAmount = payments
    .filter((payment) => payment.status === "PAID")
    .reduce((total, payment) => total + Number(payment.amount), 0);

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <h2>
          FOODDIE<span>.</span>
        </h2>

        <p className="sidebar-label">ADMIN PANEL</p>

        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/foods">Food Management</Link>
          <Link href="/admin/categories">Categories</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/payments" className="active">
            Payments
          </Link>
          <Link href="/admin/users">Users</Link>
        </nav>
      </aside>

      <section className="admin-dashboard">
        <div className="food-header">
          <div>
            <h1>Payment Management</h1>
            <p>Monitor transactions and manage customer payments.</p>
          </div>

          <button
            className="add-food-btn"
            onClick={loadPayments}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="order-summary">
          <div className="admin-stat-card">
            <CreditCard size={22} />
            <h2>{payments.length}</h2>
            <p>Total Payments</p>
          </div>

          <div className="admin-stat-card">
            <CheckCircle2 size={22} />
            <h2>{paidCount}</h2>
            <p>Successful</p>
          </div>

          <div className="admin-stat-card">
            <Clock3 size={22} />
            <h2>{pendingCount}</h2>
            <p>Pending</p>
          </div>

          <div className="admin-stat-card">
            <XCircle size={22} />
            <h2>{failedCount}</h2>
            <p>Failed</p>
          </div>

          <div className="admin-stat-card">
            <RotateCcw size={22} />
            <h2>{refundedCount}</h2>
            <p>Refunded</p>
          </div>

          <div className="admin-stat-card">
            <Receipt size={22} />
            <h2>₹{collectedAmount.toFixed(2)}</h2>
            <p>Collected Amount</p>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="food-table-wrapper">
          {loading ? (
            <p className="order-message">Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="order-message">No payments found.</p>
          ) : (
            <table className="food-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>#{payment.id.slice(-8)}</td>

                    <td>
                      <strong>{payment.order.user.name}</strong>
                      <br />
                      <small>{payment.order.user.email}</small>
                    </td>

                    <td>#{payment.order.orderId}</td>

                    <td>{payment.method}</td>

                    <td>₹{Number(payment.amount).toFixed(2)}</td>

                    <td>
                      <button
                        type="button"
                        className="order-status-select"
                        onClick={() =>
                          updateTransactionId(
                            payment.id,
                            payment.transactionId
                          )
                        }
                      >
                        {payment.transactionId || "Add Transaction ID"}
                      </button>
                    </td>

                    <td>
                      {new Date(
                        payment.paidAt || payment.createdAt
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <select
                        className="order-status-select"
                        value={payment.status}
                        onChange={(event) =>
                          updateStatus(payment.id, event.target.value)
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