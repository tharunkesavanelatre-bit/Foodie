"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bike,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  RefreshCw,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import "./delivery-partners.css";

type Partner = {
  id: string;
  userId: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isAvailable: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/delivery-partners", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load applications.");
      }

      setPartners(data.partners || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  async function updateApplication(
    id: string,
    status: "APPROVED" | "REJECTED"
  ) {
    const action = status === "APPROVED" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this application?`)) {
      return;
    }

    setProcessingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/delivery-partners", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update application.");
      }

      setMessage(data.message || "Application updated successfully.");

      await fetchPartners();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProcessingId(null);
    }
  }

  const pendingCount = partners.filter(
    (partner) => partner.status === "PENDING"
  ).length;

  const approvedCount = partners.filter(
    (partner) => partner.status === "APPROVED"
  ).length;

  const rejectedCount = partners.filter(
    (partner) => partner.status === "REJECTED"
  ).length;

  const filteredPartners = partners.filter((partner) => {
    const matchesFilter =
      filter === "ALL" || partner.status === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      partner.user.name.toLowerCase().includes(searchText) ||
      partner.user.email.toLowerCase().includes(searchText) ||
      partner.phone.toLowerCase().includes(searchText) ||
      partner.vehicleNumber.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="admin-partners-page">
      <div className="admin-partners-container">
        <Link href="/admin" className="admin-partners-back">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <header className="admin-partners-header">
          <div>
            <span className="admin-partners-eyebrow">
              ADMINISTRATION
            </span>

            <h1>Delivery Partners</h1>

            <p>
              Review applications and manage your delivery partner network.
            </p>
          </div>

          <button
            type="button"
            className="admin-partners-refresh"
            onClick={fetchPartners}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        <section className="admin-partners-stats">
          <div className="admin-partners-stat">
            <div className="admin-partners-stat-icon total">
              <Users size={22} />
            </div>
            <div>
              <span>Total Applications</span>
              <strong>{partners.length}</strong>
            </div>
          </div>

          <div className="admin-partners-stat">
            <div className="admin-partners-stat-icon pending">
              <Clock size={22} />
            </div>
            <div>
              <span>Pending Review</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="admin-partners-stat">
            <div className="admin-partners-stat-icon approved">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span>Approved</span>
              <strong>{approvedCount}</strong>
            </div>
          </div>

          <div className="admin-partners-stat">
            <div className="admin-partners-stat-icon rejected">
              <XCircle size={22} />
            </div>
            <div>
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
            </div>
          </div>
        </section>

        {error && (
          <div className="admin-partners-alert error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {message && (
          <div className="admin-partners-alert success">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        <section className="admin-partners-content">
          <div className="admin-partners-toolbar">
            <div>
              <h2>Applications</h2>
              <p>Review and manage registered delivery partners.</p>
            </div>

            <div className="admin-partners-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search name, email or vehicle..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="admin-partners-filters">
            {(
              ["ALL", "PENDING", "APPROVED", "REJECTED"] as FilterStatus[]
            ).map((status) => (
              <button
                key={status}
                type="button"
                className={filter === status ? "active" : ""}
                onClick={() => setFilter(status)}
              >
                {status === "ALL"
                  ? "All"
                  : status.charAt(0) + status.slice(1).toLowerCase()}

                <span>
                  {status === "ALL"
                    ? partners.length
                    : partners.filter((partner) => partner.status === status)
                        .length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="admin-partners-empty">
              <RefreshCw className="admin-partners-loading-icon" size={30} />
              <p>Loading delivery partner applications...</p>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="admin-partners-empty">
              <Bike size={42} />
              <h3>No applications found</h3>
              <p>
                {search
                  ? "Try changing your search."
                  : "There are no applications in this category yet."}
              </p>
            </div>
          ) : (
            <div className="admin-partners-table-wrapper">
              <table className="admin-partners-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Contact</th>
                    <th>Vehicle Details</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPartners.map((partner) => (
                    <tr key={partner.id}>
                      <td>
                        <div className="admin-partners-applicant">
                          <div className="admin-partners-avatar">
                            {partner.user.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{partner.user.name}</strong>
                            <span>{partner.user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-partners-contact">
                          <span>
                            <Phone size={14} />
                            {partner.phone}
                          </span>
                          <span>
                            <Mail size={14} />
                            {partner.user.email}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-partners-vehicle">
                          <span>
                            <Bike size={16} />
                            {partner.vehicleType}
                          </span>
                          <strong>{partner.vehicleNumber}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="admin-partners-date">
                          <CalendarDays size={15} />
                          {formatDate(partner.createdAt)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-partners-status ${partner.status.toLowerCase()}`}
                        >
                          {partner.status === "PENDING" && <Clock size={14} />}
                          {partner.status === "APPROVED" && (
                            <CheckCircle2 size={14} />
                          )}
                          {partner.status === "REJECTED" && (
                            <XCircle size={14} />
                          )}
                          {partner.status}
                        </span>
                      </td>

                      <td>
                        {partner.status === "PENDING" ? (
                          <div className="admin-partners-actions">
                            <button
                              type="button"
                              className="approve"
                              onClick={() =>
                                updateApplication(partner.id, "APPROVED")
                              }
                              disabled={processingId !== null}
                              title="Approve application"
                            >
                              <CheckCircle2 size={16} />
                              Approve
                            </button>

                            <button
                              type="button"
                              className="reject"
                              onClick={() =>
                                updateApplication(partner.id, "REJECTED")
                              }
                              disabled={processingId !== null}
                              title="Reject application"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="admin-partners-reviewed">
                            <ShieldCheck size={16} />
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="admin-partners-footer">
            Showing {filteredPartners.length} of {partners.length} applications
          </div>
        </section>
      </div>
    </main>
  );
}
