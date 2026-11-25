"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  ShoppingBag,
  Package,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  MapPin,
  CreditCard,
} from "lucide-react";

type Order = {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  delivery: number;
  total: number;
  payment: string;
  status: string;
  createdAt: string;
};

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderId = new URLSearchParams(
          window.location.search
        ).get("orderId");

        if (!orderId) {
          throw new Error("Order ID not found.");
        }

        const response = await fetch(
          `/api/orders/${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load order.");
        }

        setOrder(data.order);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  if (loading) {
    return (
      <main className="success-page">
        <div className="success-container">
          <div className="success-card">
            <h2>Loading your order details...</h2>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="success-page">
        <div className="success-container">
          <div className="success-card">
            <h2>Unable to load order</h2>
            <p>{error || "Order details are unavailable."}</p>
            <Link href="/cart" className="success-shop-button">
              Return to My Cart
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="success-page">
      <div className="success-decoration success-decoration-one" />
      <div className="success-decoration success-decoration-two" />

      <div className="success-container">
        <div className="success-card">
          <div className="success-badge">
            <Sparkles size={14} />
            ORDER CONFIRMED
          </div>

          <div className="success-icon-wrapper">
            <div className="success-icon-circle">
              <Check size={45} strokeWidth={3} />
            </div>

            <span className="success-icon-sparkle sparkle-one">âœ¦</span>
            <span className="success-icon-sparkle sparkle-two">âœ¦</span>
            <span className="success-icon-sparkle sparkle-three">âœ§</span>
          </div>

          <h1>
            Deliciousness <span>is on its way!</span>
          </h1>

          <p className="success-description">
            Thank you for choosing Foodie. Your order has been
            placed successfully. Get ready to enjoy something delicious!
          </p>

          <div className="success-order-card">
            <div className="success-order-heading">
              <div>
                <span>ORDER DETAILS</span>
                <h2>Your Order Summary</h2>
              </div>

              <div className="success-order-status">
                <Check size={13} />
                {order.status}
              </div>
            </div>

            <div className="success-order-divider" />

            <div className="success-order-row">
              <span>Order ID</span>
              <strong>{order.orderId}</strong>
            </div>

            <div className="success-order-row">
              <span>Customer</span>
              <strong>{order.name}</strong>
            </div>

            <div className="success-order-row">
              <span>Phone Number</span>
              <strong>{order.phone}</strong>
            </div>

            <div className="success-order-divider" />

            <div className="success-extra-heading">
              <Package size={17} />
              Ordered Items
            </div>

            {order.items.map((item) => (
              <div className="success-order-row" key={item.name}>
                <span>
                  {item.name} Ã— {item.quantity}
                </span>
                <strong>
                  â‚¹{(item.price * item.quantity).toFixed(2)}
                </strong>
              </div>
            ))}

            <div className="success-order-divider" />

            <div className="success-extra-heading">
              <MapPin size={17} />
              Delivery Address
            </div>

            <p className="success-address">
              {order.address}, {order.city} - {order.pincode}
            </p>

            <div className="success-order-row">
              <span>
                <CreditCard size={14} /> Payment Method
              </span>
              <strong>{order.payment}</strong>
            </div>

            <div className="success-order-row">
              <span>Order Date</span>
              <strong>
                {new Date(order.createdAt).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="success-order-total">
              <span>Total Amount</span>
              <strong>â‚¹{order.total.toFixed(2)}</strong>
            </div>
          </div>

          <div className="success-delivery-note">
            <div>
              <Truck size={20} />
            </div>

            <p>
              <strong>What's next?</strong>
              <span>
                Your order is confirmed. You can find it anytime
                in the Confirmed Orders section of My Cart.
              </span>
            </p>
          </div>

          <div className="success-actions">
            <Link href="/products" className="success-shop-button">
              <ShoppingBag size={18} />
              Continue Shopping
              <ArrowRight size={17} />
            </Link>

            <Link href="/cart" className="success-orders-button">
              <Package size={18} />
              View My Cart
            </Link>
          </div>

          <div className="success-footer-note">
            <ShieldCheck size={15} />
            Thank you for being part of Foodie!
          </div>
        </div>
      </div>
    </main>
  );
}
