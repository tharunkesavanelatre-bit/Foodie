"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingBasket,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price.replace(/[^\d.]/g, "")) * item.quantity,
    0
  );

  const delivery = cart.length > 0 ? 30 : 0;
  const total = subtotal + delivery;

  return (
    <main className="cart-page">
      <div className="cart-container">
        <Link href="/products" className="cart-back-link">
          <ArrowLeft size={18} />
          Continue Shopping
        </Link>

        <div className="cart-heading">
          <span>YOUR FOOD SELECTION</span>
          <h1>My Shopping Cart</h1>
          <p>Good food is just a few steps away.</p>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingBag size={38} />
            </div>

            <h2>Your cart is waiting!</h2>

            <p>
              You haven't added any delicious food yet.
              Let's find something you love.
            </p>

            <Link href="/products" className="cart-shop-button">
              Explore Foods
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-section">
              <div className="cart-items-heading">
                <h2>Your Items</h2>
                <span>{cart.length} products</span>
              </div>

              {cart.map((item) => (
                <article key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      unoptimized
                    />
                  </div>

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <strong>{item.price}</strong>

                    <div className="cart-quantity">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="cart-remove"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={19} />
                  </button>
                </article>
              ))}

              <Link href="/products" className="cart-add-more">
                <ShoppingBasket size={18} />
                Add More Delicious Foods
              </Link>
            </section>

            <aside className="cart-summary">
              <div className="cart-summary-heading">
                <ShoppingBag size={21} />
                <h2>Order Summary</h2>
              </div>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(2)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Delivery Charges</span>
                <strong>₹{delivery.toFixed(2)}</strong>
              </div>

              <div className="cart-summary-total">
                <span>Total Amount</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>

              <Link href="/checkout" className="cart-checkout-button">
                Proceed to Checkout
              </Link>

              <div className="cart-trust">
                <div>
                  <Truck size={18} />
                  <span>Delivery at your doorstep</span>
                </div>

                <div>
                  <ShieldCheck size={18} />
                  <span>Secure checkout experience</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}