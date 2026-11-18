"use client";

import { useEffect, useState } from "react";
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
  PackageCheck,
  CalendarDays,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";
import "./cart.css";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

type Order = {
  id: string;
  orderId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  payment: string;
  subtotal: number;
  delivery: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load orders.");
        }

        setOrders(data.orders || []);
      } catch (error) {
        setOrderError(
          error instanceof Error ? error.message : "Unable to load orders."
        );
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price.replace(/[^\d.]/g, "")) * item.quantity,
    0
  );

  const delivery = cart.length > 0 ? 30 : 0;
  const total = subtotal + delivery;

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  const totalItems = orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  return (
    <main className="cart-page">
      <div className="cart-wrapper">
        <Link href="/products" className="cart-back-link">
          <ArrowLeft size={18} />
          Continue Shopping
        </Link>

        <div className="cart-heading">
          <div>
            <span className="cart-label">YOUR FOOD SELECTION</span>
            <h1>My Shopping Cart</h1>
            <p>Manage your food selections and previous orders.</p>
          </div>

          <div className="cart-heading-icon">
            <ShoppingBag size={30} />
          </div>
        </div>

        {/* ACTIVE CART */}

        <section className="cart-section">
          <div className="cart-section-heading">
            <div>
              <span className="cart-label">CURRENT SELECTION</span>
              <h2>Active Cart</h2>
            </div>

            <span className="cart-count">{cart.length} items</span>
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingBag size={38} />
              </div>

              <h1>Your cart is waiting!</h1>

              <p>
                You haven't added any delicious food yet. Let's find something
                you love.
              </p>

              <Link href="/products" className="cart-primary-button">
                Explore Foods
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <section className="cart-items-section">
                <div className="cart-items-header">
                  <h2>Your Items</h2>
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

                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p>{item.price}</p>

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

                    <div className="cart-item-actions">
                      <strong>
                        ₹
                        {(
                          Number(item.price.replace(/[^\d.]/g, "")) *
                          item.quantity
                        ).toFixed(2)}
                      </strong>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="cart-remove-button"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>
                  </article>
                ))}

                <Link href="/products" className="cart-continue-link">
                  <ShoppingBasket size={18} />
                  Add More Delicious Foods
                </Link>
              </section>

              <aside className="cart-summary">
                <h2>Order Summary</h2>

                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>

                <div className="cart-summary-row">
                  <span>Delivery Charges</span>
                  <strong>₹{delivery.toFixed(2)}</strong>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-total">
                  <span>Total Amount</span>
                  <strong>₹{total.toFixed(2)}</strong>
                </div>

                <Link href="/checkout" className="cart-checkout-button">
                  Proceed to Checkout
                </Link>

                <div className="cart-security">
                  <ShieldCheck size={17} />
                  Secure checkout experience
                </div>

                <div className="cart-security">
                  <Truck size={17} />
                  Delivery at your doorstep
                </div>
              </aside>
            </div>
          )}
        </section>

        {/* PURCHASE HISTORY */}

        <section className="purchase-history">
          <div className="purchase-heading">
            <div>
              <span className="cart-label">YOUR PURCHASE HISTORY</span>
              <h2>Orders & Purchases</h2>
              <p>All your confirmed food orders in one place.</p>
            </div>

            <div className="purchase-count">
              <PackageCheck size={22} />
              <div>
                <strong>{orders.length}</strong>
                <span>Total Orders</span>
              </div>
            </div>
          </div>

          {!loadingOrders && !orderError && orders.length > 0 && (
            <div className="purchase-stats">
              <div>
                <span>Total Orders</span>
                <strong>{orders.length}</strong>
              </div>

              <div>
                <span>Total Spent</span>
                <strong>₹{totalSpent.toFixed(2)}</strong>
              </div>

              <div>
                <span>Items Purchased</span>
                <strong>{totalItems}</strong>
              </div>
            </div>
          )}

          {loadingOrders ? (
            <div className="cart-loader" />
          ) : orderError ? (
            <p className="orders-message">{orderError}</p>
          ) : orders.length === 0 ? (
            <div className="purchase-empty">
              <PackageCheck size={42} />
              <h3>Your purchase history is empty</h3>
              <p>Your confirmed orders will appear here after checkout.</p>

              <Link href="/products" className="cart-primary-button">
                Explore Foods
              </Link>
            </div>
          ) : (
            <div className="purchase-list">
              {orders.map((order) => (
                <article key={order.id} className="purchase-card">
                  <div className="purchase-card-top">
                    <div>
                      <span className="purchase-overline">
                        ORDER REFERENCE
                      </span>
                      <h3>{order.orderId}</h3>
                    </div>

                    <span className="purchase-status">
                      <span className="status-dot" />
                      {order.status}
                    </span>
                  </div>

                  <div className="purchase-date">
                    <CalendarDays size={16} />
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </div>

                  <div className="purchase-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="purchase-item">
                        <div className="purchase-item-image">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={90}
                              height={90}
                              unoptimized
                            />
                          ) : (
                            <ShoppingBag size={25} />
                          )}
                        </div>

                        <div className="purchase-item-info">
                          <h4>{item.name}</h4>
                          <span>
                            ₹{item.price.toFixed(2)} × {item.quantity}
                          </span>
                        </div>

                        <strong className="purchase-item-price">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="purchase-information">
                    <div className="purchase-info-box">
                      <Truck size={19} />
                      <div>
                        <span>DELIVERY ADDRESS</span>
                        <p>
                          {order.address}, {order.city} - {order.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="purchase-info-box">
                      <ShieldCheck size={19} />
                      <div>
                        <span>PAYMENT METHOD</span>
                        <p>{order.payment}</p>
                      </div>
                    </div>
                  </div>

                  <div className="purchase-total">
                    <div>
                      <span>Order Total</span>
                      <small>Including delivery charges</small>
                    </div>

                    <strong>₹{order.total.toFixed(2)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}