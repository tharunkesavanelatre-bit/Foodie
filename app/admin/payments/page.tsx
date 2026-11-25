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
  X,
  Hash,
  Save,
  Pencil,
} from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";

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
  const { showToast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingPaymentId, setUpdatingPaymentId] = useState<
    string | null
  >(null);

  const [updatingTransactionId, setUpdatingTransactionId] =
    useState<string | null>(null);

  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [transactionIdInput, setTransactionIdInput] = useState("");

  async function loadPayments() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/payments", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load payments."
        );
      }

      setPayments(data.payments || []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingPaymentId(id);

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
        throw new Error(
          data.message || "Unable to update payment."
        );
      }

      await loadPayments();

      showToast(
        `Payment status updated to ${status}.`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Payment update failed.",
        "error"
      );
    } finally {
      setUpdatingPaymentId(null);
    }
  }

  function openTransactionModal(payment: Payment) {
    setSelectedPayment(payment);
    setTransactionIdInput(payment.transactionId || "");
  }

  function closeTransactionModal() {
    if (updatingTransactionId) return;

    setSelectedPayment(null);
    setTransactionIdInput("");
  }

  async function saveTransactionId() {
    if (!selectedPayment) return;

    const id = selectedPayment.id;
    const transactionId = transactionIdInput.trim();

    setUpdatingTransactionId(id);

    try {
      const response = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          transactionId: transactionId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update transaction ID."
        );
      }

      setSelectedPayment(null);
      setTransactionIdInput("");

      await loadPayments();

      showToast(
        transactionId
          ? "Transaction ID updated successfully."
          : "Transaction ID removed successfully.",
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Transaction update failed.",
        "error"
      );
    } finally {
      setUpdatingTransactionId(null);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (!selectedPayment) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeTransactionModal();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedPayment, updatingTransactionId]);

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
    .reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <h2>
          Foodie<span>.</span>
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
            <p>
              Monitor transactions and manage customer payments.
            </p>
          </div>

          <button
            className="add-food-btn"
            onClick={loadPayments}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
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
            <h2>â‚¹{collectedAmount.toFixed(2)}</h2>
            <p>Collected Amount</p>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="food-table-wrapper">
          {loading ? (
            <p className="order-message">
              Loading payments...
            </p>
          ) : payments.length === 0 ? (
            <p className="order-message">
              No payments found.
            </p>
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
                      <strong>
                        {payment.order.user.name}
                      </strong>
                      <br />
                      <small>
                        {payment.order.user.email}
                      </small>
                    </td>

                    <td>#{payment.order.orderId}</td>

                    <td>{payment.method}</td>

                    <td>
                      â‚¹{Number(payment.amount).toFixed(2)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="order-status-select"
                        disabled={
                          updatingTransactionId === payment.id
                        }
                        onClick={() =>
                          openTransactionModal(payment)
                        }
                      >
                        {payment.transactionId || "Add Transaction ID"}
                        <Pencil
                          size={13}
                          style={{
                            marginLeft: "6px",
                            display: "inline",
                          }}
                        />
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
                        disabled={
                          updatingPaymentId === payment.id
                        }
                        onChange={(event) =>
                          updateStatus(
                            payment.id,
                            event.target.value
                          )
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingPaymentId === payment.id && (
                        <small>Updating...</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Transaction ID Modal */}
      {selectedPayment && (
        <div
          className="transaction-modal-overlay"
          onClick={closeTransactionModal}
        >
          <div
            className="transaction-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
          >
            <div className="transaction-modal-header">
              <div className="transaction-modal-icon">
                <Hash size={25} />
              </div>

              <button
                type="button"
                className="transaction-modal-close"
                onClick={closeTransactionModal}
                disabled={!!updatingTransactionId}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <span className="transaction-modal-label">
              PAYMENT MANAGEMENT
            </span>

            <h2 id="transaction-modal-title">
              Transaction ID
            </h2>

            <p className="transaction-modal-description">
              Add or update the transaction reference for this
              payment.
            </p>

            <div className="transaction-modal-order">
              <span>Payment ID</span>
              <strong>
                #{selectedPayment.id.slice(-8)}
              </strong>
            </div>

            <div className="transaction-modal-order">
              <span>Order ID</span>
              <strong>
                #{selectedPayment.order.orderId}
              </strong>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveTransactionId();
              }}
            >
              <label
                htmlFor="transaction-id-input"
                className="transaction-modal-field-label"
              >
                Transaction Reference
              </label>

              <div className="transaction-modal-input-wrapper">
                <Hash size={19} />

                <input
                  id="transaction-id-input"
                  type="text"
                  placeholder="Enter transaction ID"
                  value={transactionIdInput}
                  onChange={(event) =>
                    setTransactionIdInput(event.target.value)
                  }
                  disabled={!!updatingTransactionId}
                  autoFocus
                />
              </div>

              <p className="transaction-modal-hint">
                Leave empty to remove the existing transaction ID.
              </p>

              <div className="transaction-modal-actions">
                <button
                  type="button"
                  className="transaction-modal-cancel"
                  onClick={closeTransactionModal}
                  disabled={!!updatingTransactionId}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="transaction-modal-save"
                  disabled={!!updatingTransactionId}
                >
                  {updatingTransactionId ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Transaction ID
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
