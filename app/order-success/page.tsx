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
    price: string;
    quantity: number;
  }[];
  total: number;
  payment: string;
  date: string;
};

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem("fooddie_latest_order");

      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    } catch {
      setOrder(null);
    }
  }, []);

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

            <span className="success-icon-sparkle sparkle-one">✦</span>
            <span className="success-icon-sparkle sparkle-two">✦</span>
            <span className="success-icon-sparkle sparkle-three">✧</span>
          </div>

          <h1>
            Deliciousness <span>is on its way!</span>
          </h1>

          <p className="success-description">
            Thank you for choosing FOODDIE. Your order has been
            placed successfully. Get ready to enjoy something delicious!
          </p>

          {order && (
            <div className="success-order-card">
              <div className="success-order-heading">
                <div>
                  <span>ORDER DETAILS</span>
                  <h2>Your Order Summary</h2>
                </div>

                <div className="success-order-status">
                  <Check size={13} />
                  Confirmed
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

              {order.items?.map((item, index) => (
                <div className="success-order-row" key={index}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>{item.price}</strong>
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
                <strong>{order.date}</strong>
              </div>

              <div className="success-order-total">
                <span>Total Amount</span>
                <strong>₹{order.total.toFixed(2)}</strong>
              </div>
            </div>
          )}

          <div className="success-delivery-note">
            <div>
              <Truck size={20} />
            </div>

            <p>
              <strong>What's next?</strong>
              <span>
                Your order has been recorded. Visit My Orders
                to check your order information.
              </span>
            </p>
          </div>

          <div className="success-actions">
            <Link href="/products" className="success-shop-button">
              <ShoppingBag size={18} />
              Continue Shopping
              <ArrowRight size={17} />
            </Link>

            <Link href="/orders" className="success-orders-button">
              <Package size={18} />
              View My Orders
            </Link>
          </div>

          <div className="success-footer-note">
            <ShieldCheck size={15} />
            Thank you for being part of FOODDIE!
          </div>
        </div>
      </div>
    </main>
  );
}