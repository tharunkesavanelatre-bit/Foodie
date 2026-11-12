"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ShoppingBag,
  ArrowRight,
  Package,
  MapPin,
  CalendarDays,
  CreditCard,
  Eye,
  X,
  Clock,
  CheckCircle2,
  Truck,
  ChefHat,
  RefreshCw,
  ShoppingCart,
  Receipt,
  PackageCheck,
  XCircle,
} from "lucide-react";

import "./orders.css";

// ==========================================
// TYPES
// ==========================================

interface OrderItem {
  id?: string | number;
  productId?: string | number;
  name?: string;
  title?: string;
  strMeal?: string;
  image?: string;
  thumbnail?: string;
  strMealThumb?: string;
  price?: number;
  quantity?: number;
}

interface FoodOrder {
  id?: string;
  orderId?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  total?: number;
  totalAmount?: number;
  grandTotal?: number;
  subtotal?: number;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
  orderDate?: string;
  date?: string;
  deliveryEstimate?: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    pincode?: string;
  };
  [key: string]: unknown;
}

// ==========================================
// HELPERS
// ==========================================

const STORAGE_KEY = "foodie_orders";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

const getOrderId = (order: FoodOrder, index: number) =>
  order.orderId || order.id || `FOODIE-${index + 1}`;

const getOrderItems = (order: FoodOrder): OrderItem[] =>
  Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.orderItems)
      ? order.orderItems
      : [];

const getOrderTotal = (order: FoodOrder) =>
  Number(
    order.total ??
    order.totalAmount ??
    order.grandTotal ??
    0
  );

const getOrderDate = (order: FoodOrder) => {
  const value = order.createdAt || order.orderDate || order.date;

  if (!value) return "Date unavailable";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatus = (status?: string) => {
  const normalized = (status || "Confirmed").toLowerCase();

  if (normalized.includes("cancel")) return "Cancelled";
  if (normalized.includes("return")) return "Returned";
  if (normalized.includes("rate")) return "Rated";
  if (
    normalized.includes("deliver") ||
    normalized.includes("complete")
  ) return "Delivered";
  if (
    normalized.includes("out for delivery") ||
    normalized.includes("shipped")
  ) return "Out for Delivery";
  if (normalized.includes("process")) return "Processing";

  return "Confirmed";
};

const getItemName = (item: OrderItem) =>
  item.name || item.title || item.strMeal || "Food Item";

const getItemImage = (item: OrderItem) =>
  item.image || item.thumbnail || item.strMealThumb || "";

const getStatusClass = (status: string) => {
  switch (status) {
    case "Delivered":
    case "Rated":
      return "status-delivered";

    case "Cancelled":
    case "Returned":
      return "status-cancelled";

    case "Out for Delivery":
      return "status-shipping";

    case "Processing":
      return "status-processing";

    default:
      return "status-confirmed";
  }
};

// ==========================================
// COMPONENT
// ==========================================

export default function OrdersPage() {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [selectedOrder, setSelectedOrder] =
    useState<FoodOrder | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // ========================================
  // LOAD ORDERS
  // ========================================

  const loadOrders = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setOrders([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setOrders(parsed);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Unable to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const handleStorage = () => loadOrders();

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // ========================================
  // UPDATE ORDER
  // ========================================

  const updateOrderStatus = (
    orderIndex: number,
    newStatus: string
  ) => {
    const updatedOrders = [...orders];

    updatedOrders[orderIndex] = {
      ...updatedOrders[orderIndex],
      status: newStatus,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedOrders)
    );

    setOrders(updatedOrders);

    if (selectedOrder) {
      setSelectedOrder(updatedOrders[orderIndex]);
    }
  };

  // ========================================
  // FILTER ORDERS
  // ========================================

  const filteredOrders = orders.filter((order) => {
    const status = getStatus(order.status);

    if (filter === "All") return true;
    if (filter === "Active") {
      return ![
        "Delivered",
        "Rated",
        "Cancelled",
        "Returned",
      ].includes(status);
    }

    if (filter === "Delivered") return status === "Delivered";

    if (filter === "Cancelled") {
      return status === "Cancelled" || status === "Returned";
    }

    return true;
  });

  // ========================================
  // ORDER COUNTS
  // ========================================

  const activeCount = orders.filter((order) =>
    ![
      "Delivered",
      "Rated",
      "Cancelled",
      "Returned",
    ].includes(getStatus(order.status))
  ).length;

  const deliveredCount = orders.filter((order) =>
    ["Delivered", "Rated"].includes(getStatus(order.status))
  ).length;

  const totalSpent = orders
    .filter((order) =>
      !["Cancelled", "Returned"].includes(getStatus(order.status))
    )
    .reduce((total, order) => total + getOrderTotal(order), 0);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="orders-page">
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>Preparing your order history...</p>
        </div>
      </main>
    );
  }

  // ========================================
  // EMPTY STATE
  // ========================================

  return (
    <main className="orders-page">

      <div className="orders-container">

        {/* HEADER */}

        <div className="orders-header">

          <div>
            <span className="orders-eyebrow">
              YOUR FOOD JOURNEY
            </span>

            <h1>
              My <span>Orders.</span>
            </h1>

            <p>
              Everything you love, all in one place.
              Track and manage your food orders.
            </p>
          </div>

          <div className="orders-header-icon">
            <ShoppingBag size={38} />
          </div>

        </div>

        {/* EMPTY STATE */}

        {orders.length === 0 ? (

          <section className="orders-empty">

            <div className="empty-illustration">
              <ShoppingBag size={55} />
              <span className="empty-spark empty-spark-one">✦</span>
              <span className="empty-spark empty-spark-two">✦</span>
            </div>

            <span className="empty-label">
              NOTHING HERE YET
            </span>

            <h2>Your next delicious order awaits!</h2>

            <p>
              You haven't placed any orders yet.
              Discover your favourite meals and
              they'll appear here.
            </p>

            <Link href="/products" className="orders-primary-btn">
              Explore Delicious Food
              <ArrowRight size={19} />
            </Link>

          </section>

        ) : (

          <>

            {/* SUMMARY */}

            <section className="orders-stats">

              <div className="orders-stat-card">
                <div className="stat-icon orange">
                  <ShoppingBag size={22} />
                </div>

                <div>
                  <span>Total Orders</span>
                  <h3>{orders.length}</h3>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="stat-icon blue">
                  <Clock size={22} />
                </div>

                <div>
                  <span>Active Orders</span>
                  <h3>{activeCount}</h3>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="stat-icon green">
                  <PackageCheck size={22} />
                </div>

                <div>
                  <span>Delivered</span>
                  <h3>{deliveredCount}</h3>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="stat-icon purple">
                  <Receipt size={22} />
                </div>

                <div>
                  <span>Total Spent</span>
                  <h3>{formatPrice(totalSpent)}</h3>
                </div>
              </div>

            </section>

            {/* ORDERS SECTION */}

            <section className="orders-list-section">

              <div className="orders-section-heading">
                <div>
                  <span className="orders-eyebrow">
                    YOUR PURCHASES
                  </span>

                  <h2>Order History</h2>
                </div>

                <Link href="/products" className="orders-continue">
                  Continue Shopping
                  <ArrowRight size={17} />
                </Link>
              </div>

              {/* FILTERS */}

              <div className="orders-filters">

                {["All", "Active", "Delivered", "Cancelled"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={
                        filter === item
                          ? "order-filter active"
                          : "order-filter"
                      }
                    >
                      {item}
                    </button>
                  )
                )}

              </div>

              {/* ORDER CARDS */}

              {filteredOrders.length === 0 ? (

                <div className="orders-no-results">
                  <Package size={35} />
                  <h3>No orders found</h3>
                  <p>There are no orders in this category.</p>
                </div>

              ) : (

                <div className="orders-grid">

                  {filteredOrders.map((order) => {

                    const originalIndex = orders.indexOf(order);
                    const items = getOrderItems(order);
                    const status = getStatus(order.status);

                    return (

                      <article
                        className="order-card"
                        key={getOrderId(order, originalIndex)}
                      >

                        {/* CARD TOP */}

                        <div className="order-card-top">

                          <div>
                            <span className="order-small-label">
                              ORDER ID
                            </span>

                            <h3>
                              #{getOrderId(order, originalIndex)}
                            </h3>
                          </div>

                          <span
                            className={`order-status ${getStatusClass(status)}`}
                          >
                            {status === "Delivered" && (
                              <CheckCircle2 size={14} />
                            )}

                            {status === "Cancelled" && (
                              <XCircle size={14} />
                            )}

                            {status === "Out for Delivery" && (
                              <Truck size={14} />
                            )}

                            {status}
                          </span>

                        </div>

                        {/* DATE */}

                        <div className="order-date">
                          <CalendarDays size={15} />
                          {getOrderDate(order)}
                        </div>

                        {/* PRODUCT PREVIEW */}

                        <div className="order-products-preview">

                          {items.slice(0, 4).map((item, index) => {

                            const image = getItemImage(item);

                            return (
                              <div
                                className="order-product-image"
                                key={`${item.id || item.productId || getItemName(item)}-${index}`}
                              >
                                {image ? (
                                  <img
                                    src={image}
                                    alt={getItemName(item)}
                                  />
                                ) : (
                                  <ChefHat size={24} />
                                )}
                              </div>
                            );
                          })}

                          {items.length > 4 && (
                            <span className="more-items">
                              +{items.length - 4}
                            </span>
                          )}

                          <span className="order-item-count">
                            {items.length} {items.length === 1 ? "item" : "items"}
                          </span>

                        </div>

                        {/* CARD BOTTOM */}

                        <div className="order-card-bottom">

                          <div>
                            <span className="order-small-label">
                              ORDER TOTAL
                            </span>

                            <strong>
                              {formatPrice(getOrderTotal(order))}
                            </strong>
                          </div>

                          <button
                            type="button"
                            className="order-view-btn"
                            onClick={() => {
                              setSelectedOrder(order);
                              setSelectedIndex(originalIndex);
                            }}
                          >
                            View Details
                            <ArrowRight size={16} />
                          </button>

                        </div>

                      </article>

                    );
                  })}

                </div>

              )}

            </section>

          </>

        )}

      </div>

      {/* =====================================
          ORDER DETAILS MODAL
      ===================================== */}

      {selectedOrder && (

        <div
          className="order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >

          <div
            className="order-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="order-modal-header">

              <div>
                <span className="orders-eyebrow">
                  ORDER INFORMATION
                </span>

                <h2>Order Details</h2>

                <p>
                  #{getOrderId(selectedOrder, selectedIndex)}
                </p>
              </div>

              <button
                type="button"
                className="order-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                <X size={22} />
              </button>

            </div>

            <div className="order-modal-content">

              {/* STATUS */}

              <div className="modal-status-box">

                <div>
                  <span>Current Order Status</span>

                  <h3>
                    {getStatus(selectedOrder.status)}
                  </h3>
                </div>

                <PackageCheck size={35} />

              </div>

              {/* ITEMS */}

              <h3 className="modal-section-title">
                Ordered Items
              </h3>

              <div className="modal-order-items">

                {getOrderItems(selectedOrder).map((item, index) => {

                  const image = getItemImage(item);

                  return (

                    <div
                      className="modal-order-item"
                      key={`${item.id || item.productId || getItemName(item)}-${index}`}
                    >

                      {image ? (
                        <img
                          src={image}
                          alt={getItemName(item)}
                        />
                      ) : (
                        <div className="modal-item-placeholder">
                          <ChefHat size={25} />
                        </div>
                      )}

                      <div className="modal-item-info">
                        <h4>{getItemName(item)}</h4>

                        <p>
                          Quantity: {item.quantity || 1}
                        </p>
                      </div>

                      <strong>
                        {formatPrice(
                          Number(item.price || 0) *
                          Number(item.quantity || 1)
                        )}
                      </strong>

                    </div>

                  );
                })}

                {getOrderItems(selectedOrder).length === 0 && (
                  <p className="modal-empty-text">
                    Item details are unavailable.
                  </p>
                )}

              </div>

              {/* DELIVERY */}

              <h3 className="modal-section-title">
                Delivery Information
              </h3>

              <div className="modal-information">

                <MapPin size={19} />

                <div>
                  <strong>
                    {selectedOrder.customer?.name || "Customer"}
                  </strong>

                  <p>
                    {selectedOrder.customer?.address || "Address unavailable"}
                  </p>

                  <p>
                    {[
                      selectedOrder.customer?.city,
                      selectedOrder.customer?.pincode,
                    ].filter(Boolean).join(" - ")}
                  </p>

                  {selectedOrder.customer?.phone && (
                    <p>{selectedOrder.customer.phone}</p>
                  )}

                </div>

              </div>

              {/* PAYMENT */}

              <div className="modal-information">

                <CreditCard size={19} />

                <div>
                  <strong>Payment Method</strong>

                  <p>
                    {selectedOrder.paymentMethod || "Not available"}
                  </p>

                  {selectedOrder.paymentStatus && (
                    <p>
                      Payment: {selectedOrder.paymentStatus}
                    </p>
                  )}
                </div>

              </div>

              {/* SUMMARY */}

              <div className="modal-total">

                <span>Total Amount</span>

                <strong>
                  {formatPrice(getOrderTotal(selectedOrder))}
                </strong>

              </div>

              {/* ACTIONS */}

              <div className="modal-actions">

                {![
                  "Delivered",
                  "Rated",
                  "Cancelled",
                  "Returned",
                ].includes(getStatus(selectedOrder.status)) && (

                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Are you sure you want to cancel this order?"
                      );

                      if (confirmed) {
                        updateOrderStatus(
                          selectedIndex,
                          "Cancelled"
                        );
                      }
                    }}
                  >
                    <XCircle size={17} />
                    Cancel Order
                  </button>

                )}

                <button
                  type="button"
                  className="modal-done-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close Details
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}
