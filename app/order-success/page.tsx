"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  ArrowRight,
  PackageCheck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock3,
  Receipt,
  Home,
  UtensilsCrossed,
  CalendarDays,
  User,
} from "lucide-react";

import "./order-success.css";

// ==========================================
// TYPES
// ==========================================

interface OrderItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  quantity: number;
  price: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
}

interface FoodOrder {
  orderId: string;
  items: OrderItem[];
  customer: CustomerDetails;
  paymentMethod: string;
  paymentStatus: string;
  upiApp?: string | null;
  subtotal: number;
  deliveryFee: number;
  gst: number;
  totalAmount: number;
  totalItems: number;
  status: string;
  createdAt: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const ORDERS_KEY = "foodie_orders";
const LATEST_ORDER_KEY = "foodie_latest_order";

// ==========================================
// HELPERS
// ==========================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isValidOrder(value: unknown): value is FoodOrder {
  if (!value || typeof value !== "object") {
    return false;
  }

  const order = value as Partial<FoodOrder>;

  return (
    typeof order.orderId === "string" &&
    Array.isArray(order.items) &&
    order.items.length > 0 &&
    !!order.customer &&
    typeof order.customer.name === "string" &&
    typeof order.totalAmount === "number"
  );
}

// ==========================================
// ORDER SUCCESS PAGE
// ==========================================

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<FoodOrder | null>(null);
  const [mounted, setMounted] = useState(false);

  // ========================================
  // LOAD ORDER
  // ========================================

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const requestedOrderId = params.get("orderId");

      const savedLatestOrder = localStorage.getItem(
        LATEST_ORDER_KEY
      );

      const savedOrders = localStorage.getItem(ORDERS_KEY);

      let latestOrder: FoodOrder | null = null;
      let orders: FoodOrder[] = [];

      if (savedLatestOrder) {
        const parsedLatest: unknown = JSON.parse(savedLatestOrder);

        if (isValidOrder(parsedLatest)) {
          latestOrder = parsedLatest;
        }
      }

      if (savedOrders) {
        const parsedOrders: unknown = JSON.parse(savedOrders);

        if (Array.isArray(parsedOrders)) {
          orders = parsedOrders.filter(isValidOrder);
        }
      }

      const matchedOrder = requestedOrderId
        ? orders.find(
            (item) => item.orderId === requestedOrderId
          ) ||
          (latestOrder?.orderId === requestedOrderId
            ? latestOrder
            : null)
        : latestOrder;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrder(matchedOrder);
    } catch (error) {
      console.error("Unable to load order:", error);
      setOrder(null);
    } finally {
      setMounted(true);
    }
  }, []);

  // ========================================
  // LOADING
  // ========================================

  if (!mounted) {
    return (
      <main className="order-success-page">
        <div className="order-success-loader">
          <span />
          <p>Preparing your order details...</p>
        </div>
      </main>
    );
  }

  // ========================================
  // ORDER NOT FOUND
  // ========================================

  if (!order) {
    return (
      <main className="order-success-page">
        <section className="order-not-found">
          <div className="order-not-found-icon">
            <Receipt size={42} />
          </div>

          <h1>Order Not Found</h1>

          <p>
            We could not find your order information.
            Please check your order history or explore
            our delicious recipes.
          </p>

          <Link href="/products">
            Explore Recipes
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  // ========================================
  // PAYMENT INFORMATION
  // ========================================

  const isCOD = order.paymentMethod === "COD";

  const paymentLabel = isCOD
    ? "Cash on Delivery"
    : order.paymentMethod === "UPI"
      ? `UPI - ${order.upiApp || "UPI Payment"}`
      : "Credit / Debit Card";

  const paymentStatus = isCOD
    ? "Payment Pending"
    : order.paymentStatus;

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="order-success-page">
      <div className="order-success-wrapper">

        {/* HEADER */}

        <header className="order-success-header">
          <Link href="/home" className="order-success-brand">
            <ChefHat size={29} />
            <span>FOODIE</span>
          </Link>

          <div className="order-success-secure" />
        </header>

        {/* SUCCESS HERO */}

        <section className="order-success-hero">
          <div className="order-success-visual">
            <div className="success-ring success-ring-one" />
            <div className="success-ring success-ring-two" />

            <div className="success-check">
              <CheckCircle2 size={66} strokeWidth={1.8} />
            </div>

            <span className="success-spark success-spark-one">
              ✦
            </span>

            <span className="success-spark success-spark-two">
              ✧
            </span>

            <span className="success-spark success-spark-three">
              ✦
            </span>
          </div>

          <span className="order-success-label">
            ORDER CONFIRMED
          </span>

          <h1>
            Your Order Has
            <span>Been Placed!</span>
          </h1>

          <p>
            Thank you for choosing FOODIE.
            Your delicious order is now confirmed
            and ready for preparation.
          </p>

          <div className="order-confirmation-badge">
            <CheckCircle2 size={17} />
            Order Successfully Placed
          </div>
        </section>

        {/* ORDER ID CARD */}

        <section className="order-id-card">
          <div className="order-id-icon">
            <PackageCheck size={25} />
          </div>

          <div className="order-id-content">
            <span>YOUR ORDER NUMBER</span>
            <h2>{order.orderId}</h2>
          </div>

          <div className="order-id-status">
            <span />
            {order.status}
          </div>
        </section>

        {/* ORDER CONTENT */}

        <div className="order-success-layout">

          {/* LEFT COLUMN */}

          <div className="order-success-main">

            {/* ORDERED ITEMS */}

            <section className="success-card">
              <div className="success-card-heading">
                <div className="success-card-heading-icon">
                  <ShoppingBag size={21} />
                </div>

                <div>
                  <h2>Your Delicious Selection</h2>

                  <p>
                    {order.totalItems} items in your order
                  </p>
                </div>
              </div>

              <div className="success-items">
                {order.items.map((item) => (
                  <div
                    className="success-item"
                    key={item.idMeal}
                  >

                    {/* FOOD IMAGE AND NATURAL STEAM */}

                    <div className="success-item-image success-food-visual">

                      <div
                        className="food-steam"
                        aria-hidden="true"
                      >
                        <span className="steam-plume steam-plume-one" />
                        <span className="steam-plume steam-plume-two" />
                        <span className="steam-plume steam-plume-three" />
                        <span className="steam-plume steam-plume-four" />
                        <span className="steam-plume steam-plume-five" />
                      </div>

                      <img
                        src={item.strMealThumb}
                        alt={item.strMeal}
                        loading="lazy"
                      />

                      <div className="food-hot-indicator">
                        <span>FRESHLY SERVED</span>
                      </div>
                    </div>

                    {/* FOOD INFORMATION */}

                    <div className="success-item-info">
                      <h3>{item.strMeal}</h3>

                      <span>
                        Quantity: {item.quantity}
                      </span>

                      <small>
                        {formatCurrency(item.price)} each
                      </small>
                    </div>

                    {/* PRICE */}

                    <strong className="success-item-price">
                      {formatCurrency(
                        item.price * item.quantity
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            {/* CUSTOMER DETAILS */}

            <section className="success-card">
              <div className="success-card-heading">
                <div className="success-card-heading-icon">
                  <MapPin size={21} />
                </div>

                <div>
                  <h2>Delivery Information</h2>
                  <p>Your delivery destination</p>
                </div>
              </div>

              <div className="success-customer-details">
                <div className="success-customer-row">
                  <User size={19} />

                  <div>
                    <span>Customer Name</span>
                    <strong>{order.customer.name}</strong>
                  </div>
                </div>

                <div className="success-customer-row">
                  <Phone size={19} />

                  <div>
                    <span>Mobile Number</span>
                    <strong>{order.customer.phone}</strong>
                  </div>
                </div>

                <div className="success-customer-row">
                  <Mail size={19} />

                  <div>
                    <span>Email Address</span>
                    <strong>{order.customer.email}</strong>
                  </div>
                </div>

                <div className="success-customer-row success-address-row">
                  <MapPin size={19} />

                  <div>
                    <span>Delivery Address</span>

                    <strong>
                      {order.customer.address},{" "}
                      {order.customer.city},{" "}
                      {order.customer.pincode}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* PAYMENT DETAILS */}

            <section className="success-card">
              <div className="success-card-heading">
                <div className="success-card-heading-icon">
                  <CreditCard size={21} />
                </div>

                <div>
                  <h2>Payment Information</h2>
                  <p>Your selected payment method</p>
                </div>
              </div>

              <div className="success-payment-details">
                <div>
                  <span>Payment Method</span>
                  <strong>{paymentLabel}</strong>
                </div>

                <div>
                  <span>Payment Status</span>

                  <strong
                    className={
                      isCOD
                        ? "payment-pending"
                        : "payment-demo"
                    }
                  >
                    {paymentStatus}
                  </strong>
                </div>

                <div>
                  <span>Order Status</span>

                  <strong className="payment-confirmed">
                    {order.status}
                  </strong>
                </div>
              </div>

              {!isCOD && (
                <div className="success-demo-notice" />
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}

          <aside className="order-success-sidebar">

            {/* BILL SUMMARY */}

            <section className="success-summary-card">
              <div className="success-summary-heading">
                <Receipt size={21} />
                <h2>Order Summary</h2>
              </div>

              <div className="success-summary-row">
                <span>Subtotal</span>

                <strong>
                  {formatCurrency(order.subtotal)}
                </strong>
              </div>

              <div className="success-summary-row">
                <span>Delivery Fee</span>

                <strong>
                  {formatCurrency(order.deliveryFee)}
                </strong>
              </div>

              <div className="success-summary-row">
                <span>GST (5%)</span>

                <strong>
                  {formatCurrency(order.gst)}
                </strong>
              </div>

              <div className="success-summary-divider" />

              <div className="success-total-row">
                <span>Total Amount</span>

                <strong>
                  {formatCurrency(order.totalAmount)}
                </strong>
              </div>

              <div className="success-summary-footer">
                <CheckCircle2 size={17} />
                Order details saved successfully
              </div>
            </section>

            {/* ORDER DATE */}

            <section className="success-date-card">
              <div className="success-date-icon">
                <CalendarDays size={23} />
              </div>

              <div>
                <span>ORDER DATE</span>
                <strong>{formatDate(order.createdAt)}</strong>
                <small>{formatTime(order.createdAt)}</small>
              </div>
            </section>

            {/* PREPARATION MESSAGE */}

            <section className="success-preparation-card">
              <div className="success-preparation-icon">
                <UtensilsCrossed size={25} />
              </div>

              <h3>Made With Care!</h3>

              <p>
                Your order has been received.
                Get ready to enjoy something delicious!
              </p>

              <div className="success-preparation-line" />

              <span>
                <Clock3 size={16} />
                Preparation starts after confirmation
              </span>
            </section>
          </aside>
        </div>

        {/* BOTTOM ACTIONS */}

        <section className="success-actions">
          <Link
            href="/products"
            className="success-primary-button"
          >
            <ShoppingBag size={19} />
            Continue Shopping
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/home"
            className="success-secondary-button"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </section>

        {/* FOOTER MESSAGE */}

        <div className="success-footer-message">
          <ChefHat size={20} />

          <span>
            Thank you for making FOODIE part of your table!
          </span>
        </div>
      </div>

      {/* NATURAL STEAM ANIMATION */}

      <style jsx>{`
        .food-steam {
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: calc(100% - 7px);
          height: 72px;
          overflow: visible;
          pointer-events: none;
          z-index: 5;
        }

        .steam-plume {
          position: absolute;
          bottom: 0;
          width: 13px;
          height: 43px;
          border-radius: 50%;
          background: linear-gradient(
            to top,
            rgba(150, 137, 125, 0.22),
            rgba(180, 169, 158, 0.12) 55%,
            transparent
          );
          filter: blur(5px);
          opacity: 0;
          transform-origin: center bottom;
          animation: softSteam 3.2s ease-out infinite;
        }

        .steam-plume-one {
          left: 17%;
          height: 38px;
          animation-delay: 0s;
        }

        .steam-plume-two {
          left: 34%;
          height: 53px;
          width: 16px;
          animation-delay: 0.8s;
        }

        .steam-plume-three {
          left: 52%;
          height: 42px;
          animation-delay: 1.5s;
        }

        .steam-plume-four {
          left: 69%;
          height: 57px;
          width: 15px;
          animation-delay: 0.4s;
        }

        .steam-plume-five {
          left: 84%;
          height: 35px;
          animation-delay: 1.9s;
        }

        @keyframes softSteam {
          0% {
            opacity: 0;
            transform: translate3d(0, 8px, 0) scale(0.65, 0.75);
          }

          25% {
            opacity: 0.38;
          }

          55% {
            opacity: 0.24;
            transform: translate3d(3px, -20px, 0) scale(1.15, 1);
          }

          100% {
            opacity: 0;
            transform: translate3d(-3px, -62px, 0) scale(1.5, 1.2);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .steam-plume {
            animation: none;
            opacity: 0.2;
          }
        }
      `}</style>
    </main>
  );
}