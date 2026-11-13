"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ShoppingBag,
  ArrowRight,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ChefHat,
  ArrowLeft,
  PackageCheck,
} from "lucide-react";

import "./cart.css";

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

// ==========================================
// CONSTANTS
// ==========================================

const CART_KEY = "foodie_cart";

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
// RECIPE PRICING
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
// GET VALID ITEM PRICE
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
// CART PAGE
// ==========================================

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // ==========================================
  // LOAD CART
  // ==========================================

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsedCart: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          const validCart: CartItem[] = parsedCart
            .filter(
              (item: CartItem) =>
                item &&
                typeof item.idMeal === "string" &&
                typeof item.strMeal === "string" &&
                typeof item.strMealThumb === "string" &&
                Number.isFinite(Number(item.quantity)) &&
                Number(item.quantity) > 0
            )
            .map((item: CartItem) => {
              const normalizedItem: CartItem = {
                ...item,
                quantity: Number(item.quantity),
              };

              return {
                ...normalizedItem,
                price: getItemPrice(normalizedItem),
              };
            });

          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCart(validCart);
        }
      }
    } catch (error) {
      console.error("Unable to load cart:", error);
    }

    setMounted(true);
  }, []);

  // ==========================================
  // SAVE CART
  // ==========================================

  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Unable to save cart:", error);
    }
  }, [cart, mounted]);

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  const increaseQuantity = (id: string) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.idMeal === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  const decreaseQuantity = (id: string) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.idMeal === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeItem = (id: string) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.idMeal !== id
      )
    );
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = () => {
    setCart([]);
  };

  // ==========================================
  // CALCULATE TOTALS
  // ==========================================

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + getItemPrice(item) * item.quantity,
    0
  );

  const deliveryFee = 30;

  const totalAmount = subtotal + deliveryFee;

  // ==========================================
  // LOADING
  // ==========================================

  if (!mounted) {
    return (
      <main className="cart-page">
        <div className="cart-loader" />
      </main>
    );
  }

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <section className="cart-empty">

          <div className="cart-empty-icon">
            <ShoppingBag size={46} />
          </div>

          <span className="cart-label">
            FOODIE COLLECTION
          </span>

          <h1>Your Cart is Empty</h1>

          <p>
            Looks like you haven&apos;t added any delicious
            recipes to your cart yet. Discover something tasty!
          </p>

          <Link
            href="/products"
            className="cart-primary-button"
          >
            <UtensilsCrossed size={19} />
            Explore Recipes
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/home"
            className="cart-back-link"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

        </section>
      </main>
    );
  }

  // ==========================================
  // CART WITH ITEMS
  // ==========================================

  return (
    <main className="cart-page">

      <section className="cart-wrapper">

        {/* HEADER */}

        <div className="cart-heading">

          <div>
            <span className="cart-label">
              FOODIE COLLECTION
            </span>

            <h1>Your Cart</h1>

            <p>
              Review your delicious recipe selections.
            </p>
          </div>

          <div className="cart-heading-icon">
            <ShoppingCart size={30} />
          </div>

        </div>

        {/* CART CONTENT */}

        <div className="cart-layout">

          {/* CART ITEMS */}

          <div className="cart-items-section">

            <div className="cart-items-header">

              <h2>
                Your Items ({totalItems})
              </h2>

              <button
                type="button"
                className="cart-clear-button"
                onClick={clearCart}
              >
                <Trash2 size={15} />
                Clear Cart
              </button>

            </div>

            <div className="cart-items-list">

              {cart.map((item) => {
                const recipePrice = getItemPrice(item);

                return (
                  <article
                    className="cart-item"
                    key={item.idMeal}
                  >

                    {/* IMAGE */}

                    <div className="cart-item-image">
                      <img
                        src={item.strMealThumb}
                        alt={item.strMeal}
                        loading="lazy"
                      />
                    </div>

                    {/* DETAILS */}

                    <div className="cart-item-details">

                      <span className="cart-item-label">
                        <ChefHat size={14} />
                        RECIPE
                      </span>

                      <h3>{item.strMeal}</h3>

                      <p>
                        ₹{recipePrice.toFixed(2)} each
                      </p>

                      {/* QUANTITY */}

                      <div className="cart-quantity">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item.idMeal)
                          }
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={15} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item.idMeal)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>

                      </div>

                    </div>

                    {/* ITEM ACTIONS */}

                    <div className="cart-item-actions">

                      <strong>
                        ₹
                        {(
                          recipePrice * item.quantity
                        ).toFixed(2)}
                      </strong>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() =>
                          removeItem(item.idMeal)
                        }
                        aria-label={`Remove ${item.strMeal}`}
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>

            {/* CONTINUE SHOPPING */}

            <Link
              href="/products"
              className="cart-continue-link"
            >
              <ArrowLeft size={17} />
              Continue Shopping
            </Link>

          </div>

          {/* ORDER SUMMARY */}

          <aside className="cart-summary">

            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>Total Items</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>
            </div>

            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <strong>
                ₹{deliveryFee.toFixed(2)}
              </strong>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>Total Amount</span>
              <strong>
                ₹{totalAmount.toFixed(2)}
              </strong>
            </div>

            {/* CHECKOUT */}

            <Link
              href="/checkout"
              className="cart-checkout-button"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>

            {/* SECURITY */}

            <div className="cart-security">
              <PackageCheck size={17} />
              <span>Secure checkout experience</span>
            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}