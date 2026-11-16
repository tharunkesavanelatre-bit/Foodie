"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Wallet,
  Banknote,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [payment, setPayment] = useState("Cash on Delivery");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price.replace(/[^\d.]/g, "")) * item.quantity,
    0
  );

  const delivery = cart.length > 0 ? 30 : 0;
  const total = subtotal + delivery;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const order = {
      orderId: `FD${Date.now()}`,
      name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
      payment,
      date: new Date().toLocaleString("en-IN"),
      status: "Confirmed",
    };

    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("fooddie_orders") || "[]"
      );

      const updatedOrders = [...savedOrders, order];

      localStorage.setItem(
        "fooddie_orders",
        JSON.stringify(updatedOrders)
      );

      localStorage.setItem(
        "fooddie_latest_order",
        JSON.stringify(order)
      );

      clearCart();

      router.push("/order-success");
    } catch {
      alert("Unable to place your order. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-empty">
        <div className="checkout-empty-icon">
          <ShoppingBag size={38} />
        </div>

        <h1>Your cart is empty</h1>
        <p>Add something delicious before proceeding to checkout.</p>

        <Link href="/products" className="checkout-empty-button">
          Explore Foods
        </Link>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <Link href="/cart" className="checkout-back">
          <ArrowLeft size={18} />
          Back to Cart
        </Link>

        <div className="checkout-heading">
          <span>ALMOST THERE!</span>
          <h1>Complete Your Order</h1>
          <p>Just a few details before deliciousness reaches you.</p>
        </div>

        <form onSubmit={handleSubmit} className="checkout-layout">
          <div className="checkout-main">
            <section className="checkout-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <MapPin size={21} />
                </div>

                <div>
                  <h2>Delivery Information</h2>
                  <p>Where should we deliver your food?</p>
                </div>
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-field">
                  <label>Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <div className="checkout-field checkout-full-width">
                  <label>Delivery Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House number, street and area"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label>City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label>PIN Code</label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <CreditCard size={21} />
                </div>

                <div>
                  <h2>Payment Method</h2>
                  <p>Choose how you would like to pay.</p>
                </div>
              </div>

              <div className="checkout-payment-options">
                {[
                  {
                    name: "UPI",
                    icon: Wallet,
                    description: "Pay using UPI",
                  },
                  {
                    name: "Credit / Debit Card",
                    icon: CreditCard,
                    description: "Pay using your card",
                  },
                  {
                    name: "Cash on Delivery",
                    icon: Banknote,
                    description: "Pay when your order arrives",
                  },
                ].map((method) => {
                  const Icon = method.icon;

                  return (
                    <label
                      key={method.name}
                      className={`checkout-payment-option ${
                        payment === method.name ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.name}
                        checked={payment === method.name}
                        onChange={() => setPayment(method.name)}
                      />

                      <div className="checkout-payment-icon">
                        <Icon size={21} />
                      </div>

                      <div className="checkout-payment-text">
                        <strong>{method.name}</strong>
                        <span>{method.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="checkout-summary">
            <div className="checkout-summary-heading">
              <ShoppingBag size={21} />
              <h2>Order Summary</h2>
            </div>

            <div className="checkout-order-items">
              {cart.map((item) => (
                <div key={item.name} className="checkout-order-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>Quantity: {item.quantity}</span>
                  </div>

                  <strong>
                    ₹{(
                      Number(item.price.replace(/[^\d.]/g, "")) *
                      item.quantity
                    ).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-price-row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>

            <div className="checkout-price-row">
              <span>Delivery Charges</span>
              <strong>₹{delivery.toFixed(2)}</strong>
            </div>

            <div className="checkout-total">
              <span>Total Amount</span>
              <strong>₹{total.toFixed(2)}</strong>
            </div>

            <button type="submit" className="checkout-place-button">
              Place Order
              <ArrowLeft size={18} className="checkout-button-arrow" />
            </button>

            <div className="checkout-trust">
              <div>
                <Truck size={18} />
                <span>Delivery to your doorstep</span>
              </div>

              <div>
                <ShieldCheck size={18} />
                <span>Secure checkout experience</span>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}