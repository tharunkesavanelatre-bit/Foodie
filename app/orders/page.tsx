"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  ArrowRight,
  Package,
  CalendarDays,
  CreditCard,
  Receipt,
  Utensils,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  TicketPercent,
  Truck,
  Tag,
} from "lucide-react";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type PaymentRecord = {
  method: string;
  amount: number;
  status: string;
  transactionId: string | null;
};

type Order = {
  id: string;
  orderId: string;
  name: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode: string | null;
  total: number;
  payment: string;
  paymentRecord: PaymentRecord | null;
  createdAt: string;
  status: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch orders.");
        }

        setOrders(data.orders || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  function formatPrice(amount: number) {
    return `₹${Number(amount || 0).toFixed(2)}`;
  }

  function getPaymentIcon(status?: string) {
    switch (status) {
      case "PAID":
        return <CheckCircle2 size={17} />;

      case "FAILED":
      case "REFUNDED":
        return <XCircle size={17} />;

      default:
        return <Clock size={17} />;
    }
  }

  return (
    <main className="orders-page">
      <div className="orders-container">
        <section className="orders-hero">
          <div>
            <span className="orders-badge">
              <Sparkles size={14} />
              YOUR FOOD JOURNEY
            </span>

            <h1>
              My <span>Orders</span>
            </h1>

            <p>
              Every delicious choice, all in one place.
              Check your FOODDIE order history here.
            </p>
          </div>

          <div className="orders-hero-icon">
            <ShoppingBag size={55} strokeWidth={1.4} />
          </div>
        </section>

        <div className="orders-overview">
          <div className="orders-overview-icon">
            <Package size={23} />
          </div>

          <div>
            <strong>{loading ? "..." : orders.length}</strong>
            <span>
              {orders.length === 1 ? "Total Order" : "Total Orders"}
            </span>
          </div>
        </div>

        {loading ? (
          <section className="orders-empty">
            <Package size={42} />
            <h2>Loading Your Orders...</h2>
            <p>Please wait while we fetch your order history.</p>
          </section>
        ) : error ? (
          <section className="orders-empty">
            <ShoppingBag size={42} />
            <h2>Unable to Load Orders</h2>
            <p>{error}</p>

            <Link href="/login" className="orders-shop-button">
              Login <ArrowRight size={18} />
            </Link>
          </section>
        ) : orders.length === 0 ? (
          <section className="orders-empty">
            <ShoppingBag size={42} />
            <h2>No Orders Yet</h2>

            <p>
              Your delicious journey starts here.
              Explore our menu and find your next favourite meal.
            </p>

            <Link href="/products" className="orders-shop-button">
              Explore Foods <ArrowRight size={18} />
            </Link>
          </section>
        ) : (
          <section className="orders-list">
            <div className="orders-list-heading">
              <div>
                <span>ORDER HISTORY</span>
                <h2>Your Recent Orders</h2>
              </div>

              <span className="orders-count">
                {orders.length} Orders
              </span>
            </div>

            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div className="order-id-group">
                    <div className="order-package-icon">
                      <Package size={21} />
                    </div>

                    <div>
                      <span>ORDER ID</span>
                      <h3>{order.orderId}</h3>
                    </div>
                  </div>

                  <span className="order-status">
                    {order.status}
                  </span>
                </div>

                <div className="order-items">
                  <div className="order-items-heading">
                    <Utensils size={17} />
                    <strong>Order Items</strong>
                  </div>

                  {order.items.map((item, index) => (
                    <div
                      className="order-item"
                      key={`${item.name}-${index}`}
                    >
                      <span>
                        {item.name}
                        <small> × {item.quantity}</small>
                      </span>

                      <strong>{formatPrice(item.price)}</strong>
                    </div>
                  ))}
                </div>

                {order.couponCode && order.discount > 0 && (
                  <div className="order-coupon-banner">
                    <div className="order-coupon-icon">
                      <TicketPercent size={22} />
                    </div>

                    <div className="order-coupon-details">
                      <span>COUPON APPLIED</span>
                      <strong>{order.couponCode}</strong>
                    </div>

                    <div className="order-coupon-savings">
                      <span>YOU SAVED</span>
                      <strong>{formatPrice(order.discount)}</strong>
                    </div>
                  </div>
                )}

                <div className="order-price-breakdown">
                  <div className="order-price-heading">
                    <Receipt size={18} />
                    <strong>Payment Breakdown</strong>
                  </div>

                  <div className="order-price-row">
                    <span>Subtotal</span>
                    <strong>{formatPrice(order.subtotal)}</strong>
                  </div>

                  {order.discount > 0 && (
                    <div className="order-price-row order-discount-row">
                      <span>
                        <Tag size={15} />
                        Coupon Discount
                      </span>

                      <strong>
                        - {formatPrice(order.discount)}
                      </strong>
                    </div>
                  )}

                  <div className="order-price-row">
                    <span>
                      <Truck size={15} />
                      Delivery Fee
                    </span>

                    <strong>{formatPrice(order.deliveryFee)}</strong>
                  </div>

                  <div className="order-price-divider" />

                  <div className="order-price-total">
                    <span>Final Amount</span>
                    <strong>{formatPrice(order.total)}</strong>
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="order-info">
                    <CalendarDays size={18} />

                    <div>
                      <span>ORDERED ON</span>
                      <strong>
                        {new Date(order.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="order-info">
                    <CreditCard size={18} />

                    <div>
                      <span>PAYMENT METHOD</span>
                      <strong>{order.payment}</strong>
                    </div>
                  </div>

                  <div className="order-info">
                    {getPaymentIcon(order.paymentRecord?.status)}

                    <div>
                      <span>PAYMENT STATUS</span>
                      <strong>
                        {order.paymentRecord?.status || "NOT AVAILABLE"}
                      </strong>
                    </div>
                  </div>
                </div>

                {order.paymentRecord?.transactionId && (
                  <div className="order-info">
                    <Receipt size={18} />

                    <div>
                      <span>TRANSACTION ID</span>
                      <strong>
                        {order.paymentRecord.transactionId}
                      </strong>
                    </div>
                  </div>
                )}

                <Link
                  href={`/orders/${order.id}`}
                  className="order-details-button"
                >
                  View Order Details
                  <ArrowRight size={18} />
                </Link>
              </article>
            ))}
          </section>
        )}

        <div className="orders-bottom-note">
          <Receipt size={17} />
          <span>
            Your FOODDIE order and payment history is securely retrieved
            from your account.
          </span>
        </div>
      </div>
    </main>
  );
}