"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  TicketPercent,
  Search,
  Tag,
  CalendarDays,
  Users,
  Pencil,
  Trash2,
  X,
  Check,
  RefreshCw,
  TrendingUp,
  Clock,
  Percent,
  IndianRupee,
} from "lucide-react";

import "./coupons.css";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    orders: number;
  };
};

type CouponForm = {
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const initialForm: CouponForm = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

const currency = (amount: number) =>
  `â‚¹${amount.toLocaleString("en-IN")}`;

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/coupons", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load coupons.");
      }

      setCoupons(result.coupons || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const getStatus = (coupon: Coupon) => {
    const now = new Date();

    if (!coupon.isActive) return "INACTIVE";

    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return "SCHEDULED";
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return "EXPIRED";
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      return "LIMIT REACHED";
    }

    return "ACTIVE";
  };

  const activeCount = coupons.filter(
    (coupon) => getStatus(coupon) === "ACTIVE"
  ).length;

  const totalUsage = coupons.reduce(
    (total, coupon) => total + coupon.usageCount,
    0
  );

  const filteredCoupons = coupons.filter((coupon) => {
    const status = getStatus(coupon);

    const matchesSearch =
      coupon.code.toLowerCase().includes(search.toLowerCase()) ||
      (coupon.description || "").toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "ALL" ||
      (filter === "ACTIVE" && status === "ACTIVE") ||
      (filter === "INACTIVE" && status === "INACTIVE") ||
      (filter === "EXPIRED" && status === "EXPIRED") ||
      (filter === "SCHEDULED" && status === "SCHEDULED");

    return matchesSearch && matchesFilter;
  });

  function openCreateForm() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(coupon: Coupon) {
    setEditingId(coupon.id);

    const toLocalDateTime = (date: string | null) => {
      if (!date) return "";

      const value = new Date(date);
      const offset = value.getTimezoneOffset() * 60000;

      return new Date(value.getTime() - offset)
        .toISOString()
        .slice(0, 16);
    };

    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      maxDiscount: coupon.maxDiscount === null
        ? ""
        : String(coupon.maxDiscount),
      usageLimit: coupon.usageLimit === null
        ? ""
        : String(coupon.usageLimit),
      startsAt: toLocalDateTime(coupon.startsAt),
      expiresAt: toLocalDateTime(coupon.expiresAt),
      isActive: coupon.isActive,
    });

    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount),
      maxDiscount: form.maxDiscount
        ? Number(form.maxDiscount)
        : null,
      usageLimit: form.usageLimit
        ? Number(form.usageLimit)
        : null,
      startsAt: form.startsAt
        ? new Date(form.startsAt).toISOString()
        : null,
      expiresAt: form.expiresAt
        ? new Date(form.expiresAt).toISOString()
        : null,
    };

    try {
      const response = await fetch("/api/admin/coupons", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : payload
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save coupon.");
      }

      setShowForm(false);
      setForm(initialForm);
      setEditingId(null);
      setMessage(
        editingId
          ? "Coupon updated successfully."
          : "Coupon created successfully."
      );

      await loadCoupons();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(coupon: Coupon) {
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update coupon.");
      }

      setMessage("Coupon status updated.");
      await loadCoupons();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update coupon."
      );
    }
  }

  async function deleteCoupon(coupon: Coupon) {
    const confirmed = window.confirm(
      `Are you sure you want to delete coupon ${coupon.code}?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/coupons?id=${encodeURIComponent(coupon.id)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete coupon.");
      }

      setMessage("Coupon deleted successfully.");
      await loadCoupons();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete coupon."
      );
    }
  }

  return (
    <main className="coupons-page">
      <header className="coupons-topbar">
        <Link href="/admin" className="coupons-back">
          <ArrowLeft size={18} />
          Admin Dashboard
        </Link>

        <div className="coupons-brand">
          Foodie<span>.</span>
        </div>

        <div className="coupons-top-label">
          <TicketPercent size={17} />
          Promotions
        </div>
      </header>

      <section className="coupons-content">
        <div className="coupons-heading">
          <div>
            <span className="coupons-eyebrow">
              MARKETING MANAGEMENT
            </span>

            <h1>Coupons & Offers</h1>

            <p>
              Create promotional campaigns and manage discounts for your
              customers.
            </p>
          </div>

          <button
            className="coupon-create-btn"
            onClick={openCreateForm}
          >
            <Plus size={19} />
            Create Coupon
          </button>
        </div>

        {message && (
          <div className="coupon-alert success">
            <Check size={17} />
            {message}
            <button onClick={() => setMessage("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="coupon-alert danger">
            {error}
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <section className="coupon-stat-grid">
          <div className="coupon-stat-card">
            <div className="coupon-stat-icon orange">
              <TicketPercent size={21} />
            </div>
            <span>Total Coupons</span>
            <strong>{coupons.length}</strong>
            <small>All promotional codes</small>
          </div>

          <div className="coupon-stat-card">
            <div className="coupon-stat-icon green">
              <TrendingUp size={21} />
            </div>
            <span>Active Coupons</span>
            <strong>{activeCount}</strong>
            <small>Currently available</small>
          </div>

          <div className="coupon-stat-card">
            <div className="coupon-stat-icon purple">
              <Users size={21} />
            </div>
            <span>Total Redemptions</span>
            <strong>{totalUsage}</strong>
            <small>Recorded coupon usage</small>
          </div>

          <div className="coupon-stat-card">
            <div className="coupon-stat-icon blue">
              <Clock size={21} />
            </div>
            <span>Inactive / Expired</span>
            <strong>
              {coupons.filter((coupon) =>
                ["INACTIVE", "EXPIRED"].includes(getStatus(coupon))
              ).length}
            </strong>
            <small>Unavailable promotions</small>
          </div>
        </section>

        <section className="coupon-management">
          <div className="coupon-management-heading">
            <div>
              <h2>All Coupons</h2>
              <p>Manage your promotional codes and discount rules.</p>
            </div>

            <button
              className="coupon-refresh-btn"
              onClick={loadCoupons}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="coupon-toolbar">
            <div className="coupon-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search coupon code or description..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="coupon-filter"
            >
              <option value="ALL">All Coupons</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </div>

          {loading ? (
            <div className="coupon-empty">
              <RefreshCw className="coupon-loading-icon" size={30} />
              <h3>Loading coupons...</h3>
              <p>Please wait while we fetch your promotions.</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="coupon-empty">
              <Tag size={38} />
              <h3>No coupons found</h3>
              <p>
                {search || filter !== "ALL"
                  ? "Try changing your search or filter."
                  : "Create your first coupon to start offering discounts."}
              </p>

              {!search && filter === "ALL" && (
                <button onClick={openCreateForm}>
                  <Plus size={17} />
                  Create First Coupon
                </button>
              )}
            </div>
          ) : (
            <div className="coupon-table-wrapper">
              <table className="coupon-table">
                <thead>
                  <tr>
                    <th>Coupon</th>
                    <th>Discount</th>
                    <th>Usage</th>
                    <th>Validity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCoupons.map((coupon) => {
                    const status = getStatus(coupon);

                    return (
                      <tr key={coupon.id}>
                        <td>
                          <div className="coupon-code-cell">
                            <div className="coupon-row-icon">
                              <TicketPercent size={19} />
                            </div>
                            <div>
                              <strong>{coupon.code}</strong>
                              <span>
                                {coupon.description || "No description"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong className="coupon-discount">
                            {coupon.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}%`
                              : currency(coupon.discountValue)}
                          </strong>
                          <span className="coupon-subtext">
                            {coupon.discountType === "PERCENTAGE"
                              ? "Percentage discount"
                              : "Fixed discount"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {coupon.usageCount}
                            {coupon.usageLimit !== null
                              ? ` / ${coupon.usageLimit}`
                              : ""}
                          </strong>
                          <span className="coupon-subtext">
                            {coupon._count?.orders ?? 0} orders
                          </span>
                        </td>

                        <td>
                          <strong>
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleDateString(
                                  "en-IN"
                                )
                              : "No expiry"}
                          </strong>
                          <span className="coupon-subtext">
                            {coupon.startsAt
                              ? `Starts ${new Date(
                                  coupon.startsAt
                                ).toLocaleDateString("en-IN")}`
                              : "Available immediately"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`coupon-status ${status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <div className="coupon-actions">
                            <button
                              title="Edit coupon"
                              onClick={() => openEditForm(coupon)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              title={
                                coupon.isActive ? "Deactivate" : "Activate"
                              }
                              onClick={() => toggleStatus(coupon)}
                            >
                              {coupon.isActive ? (
                                <X size={17} />
                              ) : (
                                <Check size={17} />
                              )}
                            </button>

                            <button
                              title="Delete coupon"
                              className="delete"
                              onClick={() => deleteCoupon(coupon)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="coupon-table-footer">
            Showing {filteredCoupons.length} of {coupons.length} coupons
          </div>
        </section>
      </section>

      {showForm && (
        <div
          className="coupon-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <section className="coupon-modal">
            <div className="coupon-modal-header">
              <div>
                <span>COUPON CONFIGURATION</span>
                <h2>{editingId ? "Edit Coupon" : "Create New Coupon"}</h2>
                <p>
                  Configure the discount, eligibility and validity.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="coupon-form-grid">
                <label className="coupon-form-full">
                  Coupon Code
                  <input
                    type="text"
                    placeholder="EXAMPLE: WELCOME20"
                    value={form.code}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        code: event.target.value.toUpperCase(),
                      })
                    }
                    required
                    maxLength={30}
                  />
                  <small>Use letters, numbers and underscores.</small>
                </label>

                <label className="coupon-form-full">
                  Description
                  <input
                    type="text"
                    placeholder="Welcome offer for new customers"
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Discount Type
                  <select
                    value={form.discountType}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        discountType: event.target.value,
                      })
                    }
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (â‚¹)</option>
                  </select>
                </label>

                <label>
                  Discount Value
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                    placeholder="20"
                    value={form.discountValue}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        discountValue: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Minimum Order Amount (â‚¹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderAmount}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        minOrderAmount: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Maximum Discount (â‚¹)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Optional"
                    value={form.maxDiscount}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        maxDiscount: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Usage Limit
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Unlimited"
                    value={form.usageLimit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        usageLimit: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Start Date
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        startsAt: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Expiry Date
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        expiresAt: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="coupon-active-toggle coupon-form-full">
                  <span>
                    <strong>Activate Coupon</strong>
                    <small>Allow customers to use this coupon.</small>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        isActive: event.target.checked,
                      })
                    }
                  />
                </label>
              </div>

              {error && (
                <div className="coupon-form-error">{error}</div>
              )}

              <div className="coupon-modal-actions">
                <button
                  type="button"
                  className="coupon-cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coupon-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check size={17} />
                      {editingId ? "Save Changes" : "Create Coupon"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
