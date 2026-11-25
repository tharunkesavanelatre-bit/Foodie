"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  UserRound,
  Mail,
  CalendarDays,
  ShoppingBag,
  Receipt,
  MapPin,
  RefreshCw,
  Package,
} from "lucide-react";

import "./customer-details.css";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CustomerOrder = {
  id: string;
  orderId: string;
  status: string;
  subtotal: number;
  delivery: number;
  total: number;
  createdAt: string;
  address: string;
  city: string;
  pincode: string;
  items: OrderItem[];
};

type Customer = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orders: CustomerOrder[];
};

export default function AdminCustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCustomer() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load customer details."
        );
      }

      setCustomer(result.customer);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function getStatusClass(status: string) {
    return status.toLowerCase().replace(/\s+/g, "-");
  }

  if (loading) {
    return (
      <main className="customer-details-page">
        <div className="customer-details-state">
          <RefreshCw className="customer-details-spinner" size={30} />
          <p>Loading customer details...</p>
        </div>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="customer-details-page">
        <div className="customer-details-state">
          <UserRound size={38} />
          <h2>Unable to load customer</h2>
          <p>{error || "Customer not found."}</p>
          <button onClick={() => router.push("/admin/customers")}>
            Back to Customers
          </button>
        </div>
      </main>
    );
  }

  const totalOrders = customer.orders.length;

  const totalSpent = customer.orders
    .filter((order) => order.status.toLowerCase() !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const completedOrders = customer.orders.filter(
    (order) => order.status.toLowerCase() === "delivered"
  ).length;

  return (
    <main className="customer-details-page">
      <header className="customer-details-header">
        <div>
          <Link href="/admin/customers" className="customer-details-back">
            <ArrowLeft size={17} />
            Back to Customers
          </Link>

          <span className="customer-details-eyebrow">
            CUSTOMER MANAGEMENT
          </span>

          <h1>Customer Profile</h1>
          <p>Customer information and complete order history.</p>
        </div>

        <button
          className="customer-details-refresh"
          onClick={loadCustomer}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className="customer-profile-card">
        <div className="customer-profile-main">
          <div className="customer-profile-avatar">
            {customer.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <span className="customer-profile-label">
              REGISTERED CUSTOMER
            </span>

            <h2>{customer.name}</h2>

            <p>
              <Mail size={15} />
              {customer.email}
            </p>
          </div>
        </div>

        <div className="customer-profile-date">
          <CalendarDays size={18} />
          <div>
            <span>Joined Foodie</span>
            <strong>{formatDate(customer.createdAt)}</strong>
          </div>
        </div>
      </section>

      <section className="customer-details-stats">
        <div className="customer-details-stat">
          <div className="customer-details-stat-icon">
            <ShoppingBag size={21} />
          </div>
          <div>
            <span>Total Orders</span>
            <h3>{totalOrders}</h3>
          </div>
        </div>

        <div className="customer-details-stat">
          <div className="customer-details-stat-icon">
            <Package size={21} />
          </div>
          <div>
            <span>Delivered Orders</span>
            <h3>{completedOrders}</h3>
          </div>
        </div>

        <div className="customer-details-stat">
          <div className="customer-details-stat-icon">
            <Receipt size={21} />
          </div>
          <div>
            <span>Total Order Value</span>
            <h3>{formatCurrency(totalSpent)}</h3>
          </div>
        </div>
      </section>

      <section className="customer-order-section">
        <div className="customer-order-heading">
          <div>
            <h2>Order History</h2>
            <p>All orders placed by this customer.</p>
          </div>

          <span>{totalOrders} Orders</span>
        </div>

        {customer.orders.length === 0 ? (
          <div className="customer-details-state customer-no-orders">
            <ShoppingBag size={38} />
            <h3>No orders yet</h3>
            <p>This customer has not placed any orders.</p>
          </div>
        ) : (
          <div className="customer-order-list">
            {customer.orders.map((order) => (
              <article className="customer-order-card" key={order.id}>
                <div className="customer-order-top">
                  <div>
                    <span className="customer-order-label">
                      ORDER NUMBER
                    </span>
                    <h3>{order.orderId}</h3>
                  </div>

                  <span
                    className={`customer-order-status ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="customer-order-info">
                  <span>
                    <CalendarDays size={15} />
                    {formatDate(order.createdAt)}
                  </span>

                  <span>
                    <Package size={15} />
                    {order.items.length} Items
                  </span>

                  <span>
                    <MapPin size={15} />
                    {order.city}, {order.pincode}
                  </span>
                </div>

                <div className="customer-order-items">
                  {order.items.map((item) => (
                    <div
                      className="customer-order-item"
                      key={item.id}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {item.quantity} × {formatCurrency(item.price)}
                        </span>
                      </div>

                      <strong>
                        {formatCurrency(item.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="customer-order-footer">
                  <span>Order Total</span>
                  <strong>{formatCurrency(order.total)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}