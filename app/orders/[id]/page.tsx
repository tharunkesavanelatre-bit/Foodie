"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  TicketPercent,
  Tag,
  Receipt,
} from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";

import "./order-details.css";

type Order = {
  id: string;
  orderId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  subtotal: number;
  delivery: number;
  discount: number;
  couponCode: string | null;
  total: number;
  payment: string;
  status: string;
  createdAt: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  paymentRecord: {
    method: string;
    amount: number;
    status: string;
    transactionId: string | null;
  } | null;
  assignment: {
    status: string;
    deliveryPartner: {
      phone: string;
      vehicleType: string;
      vehicleNumber: string;
    };
  } | null;
};

const formatPrice = (amount: number) =>
  `₹${amount.toFixed(2)}`;

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  async function fetchOrder() {
    try {
      setError("");

      const response = await fetch(
        `/api/orders/${encodeURIComponent(id)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load order.");
      }

      setOrder(data.order);
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
    if (id) fetchOrder();
  }, [id]);

  async function cancelOrder() {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order?"
      )
    ) {
      return;
    }

    setCancelling(true);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(id)}/cancel`,
        { method: "PATCH" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel order."
        );
      }

      await fetchOrder();

      showToast(
        "Your order has been cancelled successfully.",
        "success"
      );
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Cancellation failed.",
        "error"
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="order-details-message">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-message">
        <p>{error || "Order not found."}</p>
        <Link href="/orders">Back to My Orders</Link>
      </div>
    );
  }

  const steps = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const currentStep = steps.indexOf(order.status);

  return (
    <main className="order-details-page">
      <Link href="/orders" className="order-back-link">
        <ArrowLeft size={18} />
        Back to My Orders
      </Link>

      <section className="order-details-header">
        <div>
          <span className="order-details-label">
            ORDER DETAILS
          </span>
          <h1>Order #{order.orderId}</h1>
          <p>
            Placed on{" "}
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>

        <span
          className={`order-status ${order.status.toLowerCase()}`}
        >
          {order.status}
        </span>
      </section>

      {order.status === "Cancelled" ? (
        <div className="order-cancelled">
          <XCircle size={22} />
          This order has been cancelled.
        </div>
      ) : (
        <section className="order-tracking-card">
          <h2>
            <Truck size={21} />
            Order Tracking
          </h2>

          <div className="order-tracking-steps">
            {steps.map((step, index) => {
              const completed =
                currentStep >= index && currentStep !== -1;

              return (
                <div
                  key={step}
                  className={`tracking-step ${
                    completed ? "completed" : ""
                  }`}
                >
                  <span className="tracking-icon">
                    {completed ? (
                      <CheckCircle size={21} />
                    ) : (
                      <Clock size={21} />
                    )}
                  </span>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>

          {order.status === "Pending" && (
            <button
              className="cancel-order-button"
              onClick={cancelOrder}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </section>
      )}

      <div className="order-details-grid">
        <section className="order-details-card">
          <h2>
            <Package size={20} />
            Ordered Items
          </h2>

          {order.items.map((item) => (
            <div className="order-detail-item" key={item.id}>
              <div>
                <h3>{item.name}</h3>
                <p>Quantity: {item.quantity}</p>
              </div>

              <strong>
                {formatPrice(item.price * item.quantity)}
              </strong>
            </div>
          ))}

          <div className="order-price-row">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>

          {order.discount > 0 && (
            <>
              <div className="order-coupon-details">
                <div className="order-coupon-icon">
                  <TicketPercent size={22} />
                </div>

                <div>
                  <span>COUPON APPLIED</span>
                  <strong>{order.couponCode}</strong>
                </div>

                <strong className="order-coupon-savings">
                  -{formatPrice(order.discount)}
                </strong>
              </div>

              <div className="order-price-row order-discount-row">
                <span>
                  <Tag size={15} />
                  Coupon Discount
                </span>
                <strong>
                  -{formatPrice(order.discount)}
                </strong>
              </div>
            </>
          )}

          <div className="order-price-row">
            <span>Delivery Fee</span>
            <span>{formatPrice(order.delivery)}</span>
          </div>

          <div className="order-total-row">
            <span>
              <Receipt size={17} />
              Total Amount
            </span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </section>

        <div className="order-details-side">
          <section className="order-details-card">
            <h2>
              <MapPin size={20} />
              Delivery Address
            </h2>

            <h3>{order.name}</h3>
            <p>{order.phone}</p>
            <p>{order.address}</p>
            <p>
              {order.city} - {order.pincode}
            </p>
          </section>

          <section className="order-details-card">
            <h2>
              <CreditCard size={20} />
              Payment Details
            </h2>

            <p>
              Method: {order.paymentRecord?.method || order.payment}
            </p>

            <p>
              Status: {order.paymentRecord?.status || "Not available"}
            </p>

            {order.paymentRecord?.transactionId && (
              <p>
                Transaction ID:{" "}
                {order.paymentRecord.transactionId}
              </p>
            )}
          </section>

          {order.assignment && (
            <section className="order-details-card">
              <h2>
                <Truck size={20} />
                Delivery Partner
              </h2>

              <p>
                Phone: {order.assignment.deliveryPartner.phone}
              </p>
              <p>
                Vehicle:{" "}
                {order.assignment.deliveryPartner.vehicleType}
              </p>
              <p>
                Number:{" "}
                {order.assignment.deliveryPartner.vehicleNumber}
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}