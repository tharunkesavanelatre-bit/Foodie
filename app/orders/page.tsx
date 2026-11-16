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
} from "lucide-react";

type Order = {
  orderId: string;
  name: string;
  items: {
    name: string;
    price: string;
    quantity: number;
  }[];
  total: number;
  payment: string;
  date: string;
  status: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const savedOrders: Order[] = JSON.parse(
        localStorage.getItem("fooddie_orders") || "[]"
      );

      setOrders(savedOrders.reverse());
    } catch {
      setOrders([]);
    }
  }, []);

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
            <strong>{orders.length}</strong>
            <span>
              {orders.length === 1 ? "Total Order" : "Total Orders"}
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <section className="orders-empty">
            <div className="orders-empty-icon">
              <ShoppingBag size={42} />
            </div>

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
              <article className="order-card" key={order.orderId}>

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

                      <strong>{item.price}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">

                  <div className="order-info">
                    <CalendarDays size={18} />
                    <div>
                      <span>ORDERED ON</span>
                      <strong>{order.date}</strong>
                    </div>
                  </div>

                  <div className="order-info">
                    <CreditCard size={18} />
                    <div>
                      <span>PAYMENT METHOD</span>
                      <strong>{order.payment}</strong>
                    </div>
                  </div>

                  <div className="order-total">
                    <span>TOTAL AMOUNT</span>
                    <strong>₹{order.total.toFixed(2)}</strong>
                  </div>

                </div>
              </article>
            ))}
          </section>
        )}

        <div className="orders-bottom-note">
          <Receipt size={17} />
          <span>Your FOODDIE order history is saved on this device.</span>
        </div>

      </div>
    </main>
  );
}