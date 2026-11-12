"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Smartphone,
  Banknote,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import "./checkout.css";

// ==========================================
// TYPES
// ==========================================

interface CartItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  price?: number;
  quantity: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
}

type PaymentMethod = "UPI" | "Card" | "COD";

// ==========================================
// CONSTANTS
// ==========================================

const CART_KEY = "foodie_cart";
const ORDERS_KEY = "foodie_orders";
const LATEST_ORDER_KEY = "foodie_latest_order";

const DELIVERY_FEE = 30;
const GST_RATE = 0.05;

// ==========================================
// SPECIFIC RECIPE PRICES
// ==========================================

const SPECIFIC_RECIPE_PRICES: Record<string, number> = {
  "chicken biryani": 249,
  "vegetable biryani": 189,
  "mutton biryani": 279,
  "paneer curry": 179,
  "butter chicken": 269,
  "fish curry": 289,
  "chocolate cake": 139,
  "margherita pizza": 199,
  "chicken burger": 219,
  "fruit salad": 99,
  "chicken pasta": 229,
  "prawn curry": 299,
  "egg fried rice": 169,
  "vegetable fried rice": 149,
  "masala dosa": 119,
  "chicken tikka": 239,
  pancakes: 129,
  lasagne: 219,
};

// ==========================================
// GET RECIPE PRICE
// ==========================================

function getRecipePrice(
  recipeId: string,
  recipeName: string,
  category?: string
): number {
  const name = recipeName.toLowerCase().trim();
  const recipeCategory = (category || "").toLowerCase();

  // SPECIFIC RECIPE PRICES

  for (const [recipe, price] of Object.entries(
    SPECIFIC_RECIPE_PRICES
  )) {
    if (name.includes(recipe)) {
      return price;
    }
  }

  // CATEGORY PRICE RANGES

  let minPrice = 129;
  let maxPrice = 249;

  if (
    recipeCategory.includes("seafood") ||
    /fish|prawn|shrimp|crab|lobster|salmon|tuna|squid|octopus|mussel|oyster/.test(
      name
    )
  ) {
    minPrice = 229;
    maxPrice = 349;
  } else if (
    recipeCategory.includes("chicken") ||
    name.includes("chicken")
  ) {
    minPrice = 189;
    maxPrice = 299;
  } else if (
    recipeCategory.includes("dessert") ||
    /cake|ice cream|pudding|brownie|cookie|mousse|tart/.test(name)
  ) {
    minPrice = 99;
    maxPrice = 199;
  } else if (
    recipeCategory.includes("vegetarian") ||
    recipeCategory.includes("vegan")
  ) {
    minPrice = 119;
    maxPrice = 229;
  } else if (recipeCategory.includes("pasta")) {
    minPrice = 149;
    maxPrice = 249;
  } else if (
    recipeCategory.includes("beef") ||
    recipeCategory.includes("lamb")
  ) {
    minPrice = 199;
    maxPrice = 299;
  }

  // CONSISTENT PRICE USING RECIPE ID

  let hash = 0;

  for (let i = 0; i < recipeId.length; i++) {
    hash =
      (hash * 31 + recipeId.charCodeAt(i)) >>> 0;
  }

  const priceRange = maxPrice - minPrice + 1;

  return minPrice + (hash % priceRange);
}

// ==========================================
// GET SAVED ITEM PRICE
// ==========================================

function getItemPrice(item: CartItem): number {
  if (
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price > 0
  ) {
    return item.price;
  }

  return getRecipePrice(
    item.idMeal,
    item.strMeal,
    item.strCategory
  );
}

// ==========================================
// CHECKOUT PAGE
// ==========================================

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("UPI");

  const [upiApp, setUpiApp] = useState("Google Pay");

  // ========================================
  // LOAD CART
  // ========================================

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsedCart: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          const validCart: CartItem[] = parsedCart
            .filter(
              (item): item is CartItem =>
                item &&
                typeof item.idMeal === "string" &&
                typeof item.strMeal === "string" &&
                typeof item.strMealThumb === "string" &&
                Number.isFinite(Number(item.quantity)) &&
                Number(item.quantity) > 0
            )
            .map((item) => ({
              ...item,
              price: getItemPrice(item),
              quantity: Number(item.quantity),
            }));

          setCart(validCart);

          // SAVE VALIDATED CART WITH PRESERVED PRICES

          localStorage.setItem(
            CART_KEY,
            JSON.stringify(validCart)
          );
        }
      }
    } catch (err) {
      console.error("Unable to load cart:", err);
      setError("Unable to load your cart. Please try again.");
    } finally {
      setMounted(true);
    }
  }, []);

  // ========================================
  // CALCULATE TOTALS
  // ========================================

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + getItemPrice(item) * item.quantity,
        0
      ),
    [cart]
  );

  const gst = subtotal * GST_RATE;

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalAmount = subtotal + gst + DELIVERY_FEE;

  // ========================================
  // HANDLE INPUT CHANGES
  // ========================================

  const handleInputChange = (
    field: keyof CustomerDetails,
    value: string
  ) => {
    setCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  // ========================================
  // VALIDATE CUSTOMER DETAILS
  // ========================================

  const validateForm = (): boolean => {
    const {
      name,
      phone,
      email,
      address,
      city,
      pincode,
    } = customer;

    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim() ||
      !city.trim() ||
      !pincode.trim()
    ) {
      setError("Please fill in all delivery details.");
      return false;
    }

    if (!/^[A-Za-z\s.'-]{2,60}$/.test(name.trim())) {
      setError("Please enter a valid name.");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (address.trim().length < 5) {
      setError("Please enter a complete delivery address.");
      return false;
    }

    if (!/^[A-Za-z\s.'-]{2,60}$/.test(city.trim())) {
      setError("Please enter a valid city.");
      return false;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Please enter a valid 6-digit PIN code.");
      return false;
    }

    return true;
  };

  // ========================================
  // PLACE ORDER
  // ========================================

  const handlePlaceOrder = () => {
    if (isSubmitting) return;

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const savedOrders = localStorage.getItem(ORDERS_KEY);

      const parsedOrders: unknown = savedOrders
        ? JSON.parse(savedOrders)
        : [];

      const previousOrders = Array.isArray(parsedOrders)
        ? parsedOrders
        : [];

      const orderId = `FD${Date.now()}`;

      // PRESERVE EXACT CART PRICES

      const orderItems = cart.map((item) => ({
        ...item,
        price: getItemPrice(item),
      }));

      const order = {
        orderId,

        items: orderItems,

        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim(),
          address: customer.address.trim(),
          city: customer.city.trim(),
          pincode: customer.pincode.trim(),
        },

        paymentMethod,

        paymentStatus:
          paymentMethod === "COD"
            ? "Pending"
            : "Demo Payment",

        upiApp:
          paymentMethod === "UPI" ? upiApp : null,

        subtotal,
        deliveryFee: DELIVERY_FEE,
        gst,
        totalAmount,
        totalItems,

        status: "Order Placed",

        statusHistory: [
          {
            status: "Order Placed",
            message: "Your order has been received.",
            timestamp: new Date().toISOString(),
          },
        ],

        createdAt: new Date().toISOString(),
      };

      const updatedOrders = [
        order,
        ...previousOrders,
      ];

      // SAVE ORDER HISTORY

      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(updatedOrders)
      );

      // SAVE LATEST ORDER

      localStorage.setItem(
        LATEST_ORDER_KEY,
        JSON.stringify(order)
      );

      // CLEAR CART

      localStorage.removeItem(CART_KEY);

      // NAVIGATE TO SUCCESS PAGE

      router.push(
        `/order-success?orderId=${encodeURIComponent(orderId)}`
      );
    } catch (err) {
      console.error("Unable to place order:", err);

      setError(
        "Unable to place your order. Please try again."
      );

      setIsSubmitting(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (!mounted) {
    return (
      <main className="checkout-page">
        <div className="checkout-loader" />
      </main>
    );
  }

  // ========================================
  // EMPTY CART
  // ========================================

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <ShoppingBag size={48} />

          <h1>Your Cart is Empty</h1>

          <p>
            Add some delicious recipes before proceeding
            to checkout.
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
  // MAIN UI
  // ========================================

  return (
    <main className="checkout-page">
      <div className="checkout-wrapper">

        {/* HEADER */}

        <header className="checkout-header">
          <Link href="/home" className="checkout-brand">
            <ChefHat size={28} />
            <span>FOODIE</span>
          </Link>

          <div className="checkout-secure">
            <ShieldCheck size={18} />
            Secure Checkout
          </div>
        </header>

        {/* PAGE TITLE */}

        <section className="checkout-title">
          <span>ALMOST THERE!</span>

          <h1>Complete Your Order</h1>

          <p>
            Add your delivery details and choose your
            preferred payment method.
          </p>
        </section>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="checkout-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <div className="checkout-layout">

          {/* LEFT SIDE */}

          <div className="checkout-main">

            {/* DELIVERY DETAILS */}

            <section className="checkout-card checkout-delivery-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <MapPin size={21} />
                </div>

                <div>
                  <h2>Delivery Information</h2>
                  <p>Where should we deliver your food?</p>
                </div>
              </div>

              <div className="checkout-form">

                <div className="checkout-field">
                  <label htmlFor="customer-name">
                    Full Name
                  </label>

                  <div className="checkout-input-wrapper">
                    <User size={18} />

                    <input
                      id="customer-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={customer.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="checkout-field">
                  <label htmlFor="customer-phone">
                    Mobile Number
                  </label>

                  <div className="checkout-input-wrapper">
                    <Phone size={18} />

                    <input
                      id="customer-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={customer.phone}
                      onChange={(e) =>
                        handleInputChange(
                          "phone",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                    />
                  </div>
                </div>

                <div className="checkout-field">
                  <label htmlFor="customer-email">
                    Email Address
                  </label>

                  <div className="checkout-input-wrapper">
                    <Mail size={18} />

                    <input
                      id="customer-email"
                      type="email"
                      placeholder="Enter your email"
                      value={customer.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="checkout-field checkout-full">
                  <label htmlFor="customer-address">
                    Delivery Address
                  </label>

                  <textarea
                    id="customer-address"
                    placeholder="House number, street, area and landmark"
                    rows={3}
                    value={customer.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="customer-city">
                    City
                  </label>

                  <input
                    id="customer-city"
                    type="text"
                    placeholder="Enter your city"
                    value={customer.city}
                    onChange={(e) =>
                      handleInputChange("city", e.target.value)
                    }
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="customer-pincode">
                    PIN Code
                  </label>

                  <input
                    id="customer-pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit PIN code"
                    value={customer.pincode}
                    onChange={(e) =>
                      handleInputChange(
                        "pincode",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                  />
                </div>

              </div>
            </section>

            {/* PAYMENT METHOD */}

            <section className="checkout-card checkout-payment-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <CreditCard size={21} />
                </div>

                <div>
                  <h2>Payment Method</h2>
                  <p>Choose how you want to pay.</p>
                </div>
              </div>

              <div className="checkout-payment-options">

                <button
                  type="button"
                  className={`checkout-payment-option ${
                    paymentMethod === "UPI" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("UPI")}
                >
                  <div className="checkout-payment-icon">
                    <Smartphone size={23} />
                  </div>

                  <div className="checkout-payment-content">
                    <strong>UPI Payment</strong>
                    <span>Google Pay, PhonePe, Paytm</span>
                  </div>

                  {paymentMethod === "UPI" && (
                    <CheckCircle2
                      className="checkout-payment-check"
                      size={20}
                    />
                  )}
                </button>

                <button
                  type="button"
                  className={`checkout-payment-option ${
                    paymentMethod === "Card" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("Card")}
                >
                  <div className="checkout-payment-icon">
                    <CreditCard size={23} />
                  </div>

                  <div className="checkout-payment-content">
                    <strong>Credit / Debit Card</strong>
                  </div>

                  {paymentMethod === "Card" && (
                    <CheckCircle2
                      className="checkout-payment-check"
                      size={20}
                    />
                  )}
                </button>

                <button
                  type="button"
                  className={`checkout-payment-option ${
                    paymentMethod === "COD" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <div className="checkout-payment-icon">
                    <Banknote size={23} />
                  </div>

                  <div className="checkout-payment-content">
                    <strong>Cash on Delivery</strong>
                    <span>Pay when your food arrives</span>
                  </div>

                  {paymentMethod === "COD" && (
                    <CheckCircle2
                      className="checkout-payment-check"
                      size={20}
                    />
                  )}
                </button>

              </div>

              {paymentMethod === "UPI" && (
                <div className="checkout-payment-extra">
                  <label>Select UPI App</label>

                  <div className="checkout-upi-options">
                    {["Google Pay", "PhonePe", "Paytm"].map(
                      (app) => (
                        <button
                          type="button"
                          key={app}
                          className={
                            upiApp === app ? "active" : ""
                          }
                          onClick={() => setUpiApp(app)}
                        >
                          {app}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

            </section>
          </div>

          {/* RIGHT SIDE - SUMMARY */}

          <aside className="checkout-summary">

            <div className="checkout-summary-heading">
              <ShoppingBag size={21} />
              <h2>Order Summary</h2>
            </div>

            <div className="checkout-summary-items">
              {cart.map((item) => {
                const price = getItemPrice(item);

                return (
                  <div
                    className="checkout-summary-item"
                    key={item.idMeal}
                  >
                    <img
                      src={item.strMealThumb}
                      alt={item.strMeal}
                    />

                    <div>
                      <h3>{item.strMeal}</h3>
                      <span>Qty: {item.quantity}</span>
                    </div>

                    <strong>
                      ₹{(price * item.quantity).toFixed(2)}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-total-row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>

            <div className="checkout-total-row">
              <span>Delivery Fee</span>
              <strong>₹{DELIVERY_FEE.toFixed(2)}</strong>
            </div>

            <div className="checkout-total-row">
              <span>GST (5%)</span>
              <strong>₹{gst.toFixed(2)}</strong>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-grand-total">
              <span>Total Amount</span>
              <strong>₹{totalAmount.toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className={`checkout-place-order ${
                isSubmitting ? "loading" : ""
              }`}
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="checkout-button-spinner" />
                  Placing Your Order...
                </>
              ) : (
                <>
                  Place Order
                  <ArrowRight size={19} />
                </>
              )}
            </button>

            <div className="checkout-trust">
              
            </div>

            <div className="checkout-delivery-info">
              <span style={{ fontSize: "19px" }}>🛵</span>
              <span>
                Your order will be prepared after confirmation.
              </span>
            </div>

          </aside>
        </div>

        {/* MOBILE STICKY CHECKOUT BAR */}

        <div className="checkout-mobile-bar">
          <div className="checkout-mobile-total">
            <span>Total Amount</span>
            <strong>₹{totalAmount.toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="checkout-mobile-order"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing..." : "Place Order"}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </div>

        {/* BACK TO CART */}

        <Link href="/cart" className="checkout-back">
          <ArrowLeft size={17} />
          Back to Cart
        </Link>

      </div>
    </main>
  );
}