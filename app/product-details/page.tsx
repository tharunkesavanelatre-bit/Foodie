"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  ChefHat,
  Utensils,
  MapPin,
  AlertCircle,
  ShoppingCart,
  Plus,
  CheckCircle2,
  Heart,
  Sparkles,
  Globe2,
  BookOpen,
  Info,
  Leaf,
  CookingPot,
  Flame,
  Coffee,
} from "lucide-react";

import "./product-details.css";

// ==========================================
// TYPES
// ==========================================

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strTags: string | null;
  strYoutube: string | null;
  [key: string]: string | null;
}

interface MealResponse {
  meals: Meal[] | null;
  message?: string;
}

interface CartItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  price?: number;
  quantity: number;
}

interface WishlistItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  price?: number;
}

interface FoodProfile {
  title: string;
  origin: string;
  background: string;
  preparation: string;
  ingredients: string;
  stages: string[];
  flavour: string;
  culture: string;
  cookingMethod: string;
}

interface Ingredient {
  name: string;
  measure: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const CART_KEY = "foodie_cart";
const WISHLIST_KEY = "foodie_wishlist";

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
// SAFE STORAGE HELPERS
// ==========================================

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save ${key}:`, error);
    return false;
  }
}

// ==========================================
// RECIPE PRICE
// ==========================================

function getRecipePrice(
  recipeId: string,
  recipeName: string,
  category?: string
): number {
  const name = recipeName.toLowerCase().trim();
  const recipeCategory = (category || "").toLowerCase();

  for (const [recipe, price] of Object.entries(
    SPECIFIC_RECIPE_PRICES
  )) {
    if (name.includes(recipe)) {
      return price;
    }
  }

  let minPrice = 129;
  let maxPrice = 249;

  if (
    recipeCategory.includes("seafood") ||
    /fish|prawn|shrimp|crab|lobster|salmon|tuna|squid|octopus|mussel|oyster/.test(name)
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

  let hash = 0;

  for (let i = 0; i < recipeId.length; i++) {
    hash = (hash * 31 + recipeId.charCodeAt(i)) >>> 0;
  }

  const priceRange = maxPrice - minPrice + 1;

  return minPrice + (hash % priceRange);
}

// ==========================================
// EXTRACT INGREDIENTS
// ==========================================

function getIngredients(recipe: Meal): Ingredient[] {
  const ingredients: Ingredient[] = [];

  for (let i = 1; i <= 20; i++) {
    const name = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();

    if (name) {
      ingredients.push({
        name,
        measure: measure || "",
      });
    }
  }

  return ingredients;
}

// ==========================================
// FOOD-SPECIFIC INFORMATION
// ==========================================

function getFoodProfile(recipe: Meal): FoodProfile {
  const name = recipe.strMeal.toLowerCase();
  const category = (recipe.strCategory || "").toLowerCase();
  const area = recipe.strArea || "Different regional cuisines";

  if (name.includes("biryani")) {
    return {
      title: "The Story Behind Biryani",
      origin:
        "Biryani is strongly associated with the Indian subcontinent. Hyderabad, Lucknow, Kolkata and other regions are famous for their distinctive biryani styles.",
      background:
        "Biryani brings together aromatic rice, spices and carefully prepared ingredients. Different regions have developed their own versions, with variations in rice, seasoning and cooking techniques.",
      preparation:
        "The preparation often begins with washing and soaking rice. Meat or vegetables are seasoned separately, while aromatic spices develop the base flavour. The rice and prepared ingredients are then layered or combined and cooked until their flavours come together.",
      ingredients:
        "Rice provides the foundation of the dish. Whole spices, herbs, onions and other seasonings contribute aroma and depth.",
      stages: [
        "Rice is washed and soaked before cooking to help achieve a suitable texture.",
        "Spices, onions and herbs are prepared to build the aromatic flavour base.",
        "The main ingredients are seasoned and cooked with the selected spices.",
        "Rice and the prepared ingredients are layered or combined according to the regional style.",
        "The dish is cooked until the rice is tender and the flavours are well combined.",
      ],
      flavour:
        "Biryani is known for its aromatic spices, fragrant rice and combination of savoury, herbal and mildly sweet notes.",
      culture:
        "Hyderabadi, Lucknowi and Kolkata biryani are among the best-known regional varieties. Biryani is commonly served at celebrations and special occasions.",
      cookingMethod: "Rice cooking and aromatic layering",
    };
  }

  if (
    /rice|pulao|pilaf|risotto|fried rice/.test(name) ||
    category.includes("rice")
  ) {
    return {
      title: "The World of Rice Dishes",
      origin:
        "Rice dishes are popular across Asia, the Middle East, Europe and many other regions.",
      background:
        "Rice is a versatile staple that absorbs flavours from spices, vegetables, sauces and other ingredients.",
      preparation:
        "Rice is cleaned and prepared before cooking. Depending on the dish, it may be boiled separately, cooked with a seasoned liquid or stir-fried with other ingredients.",
      ingredients:
        "Rice is the main ingredient, while vegetables, herbs, spices, sauces and proteins provide additional flavour and texture.",
      stages: [
        "Rice is selected and cleaned to prepare it for cooking.",
        "Vegetables, herbs and other ingredients are cut and arranged.",
        "Spices, sauces or aromatic ingredients are prepared.",
        "Rice is cooked using the method suitable for the dish.",
        "The remaining ingredients are combined with the rice.",
      ],
      flavour:
        "Rice dishes can range from mild and fragrant to spicy, savoury or creamy.",
      culture:
        "Rice has an important place in everyday meals and traditional celebrations across many countries.",
      cookingMethod: "Boiling, steaming or stir-frying",
    };
  }

  if (name.includes("pizza")) {
    return {
      title: "The Story Behind Pizza",
      origin:
        "Modern pizza is especially associated with Naples, Italy, where traditional Neapolitan pizza became famous.",
      background:
        "Pizza is built around a dough base topped with sauce, cheese and other ingredients.",
      preparation:
        "The dough is prepared and allowed to rise. Sauce, cheese and toppings are arranged over the base before baking.",
      ingredients:
        "Flour, yeast, water and salt form the dough. Tomato sauce, cheese, vegetables, herbs and optional meat provide the toppings.",
      stages: [
        "Flour, yeast, water and salt are combined to form the dough.",
        "The dough is kneaded and allowed to rise.",
        "The dough is shaped into a pizza base.",
        "Sauce, cheese and selected toppings are arranged over the base.",
        "The pizza is baked until the crust is cooked and the cheese melts.",
      ],
      flavour:
        "Pizza combines a soft or crisp crust with savoury sauce, melted cheese and toppings.",
      culture:
        "Naples is famous for traditional Neapolitan pizza, which has influenced pizza styles around the world.",
      cookingMethod: "Dough preparation and oven baking",
    };
  }

  if (/pasta|spaghetti|macaroni|lasagna|penne|fettuccine/.test(name)) {
    return {
      title: "Discover the World of Pasta",
      origin:
        "Pasta is closely associated with Italian cuisine, which has developed many regional pasta shapes, sauces and preparation traditions.",
      background:
        "Pasta comes in different shapes and sizes. Each shape works with different sauces and ingredients.",
      preparation:
        "Pasta is cooked in water until it reaches the desired texture. Meanwhile, a sauce is prepared and combined with the cooked pasta.",
      ingredients:
        "Pasta forms the base, while sauces, herbs, vegetables, cheese and optional meat create the character of the dish.",
      stages: [
        "The pasta shape is selected according to the dish.",
        "Water is heated and the pasta is cooked.",
        "The sauce is prepared using the selected ingredients.",
        "The cooked pasta is combined with the sauce.",
        "Herbs, cheese or other finishing ingredients complete the dish.",
      ],
      flavour:
        "Pasta can be creamy, tangy, cheesy, savoury or herbaceous depending on the sauce.",
      culture:
        "Italy is famous for its regional pasta traditions and distinctive shapes and sauces.",
      cookingMethod: "Boiling and sauce preparation",
    };
  }

  if (name.includes("burger")) {
    return {
      title: "What Makes a Burger Special?",
      origin:
        "The modern hamburger is strongly associated with the United States, with influences from other food traditions.",
      background:
        "A burger combines a bread bun with a filling and selected toppings.",
      preparation:
        "The patty is prepared and cooked, while the bun and toppings are arranged separately. The ingredients are assembled before serving.",
      ingredients:
        "A bun provides the base. The filling may include a meat or vegetable patty, cheese, lettuce, tomato, onion and sauces.",
      stages: [
        "The patty mixture or selected filling is prepared.",
        "The patty is shaped and seasoned.",
        "The patty is cooked until ready.",
        "The bun is prepared and lightly toasted when required.",
        "The patty, vegetables, cheese and sauces are assembled.",
      ],
      flavour:
        "Burgers bring together soft bread, a savoury filling, fresh vegetables and sauces.",
      culture:
        "Burgers are a popular part of American fast-food culture and have developed many international variations.",
      cookingMethod: "Grilling, pan-frying and assembly",
    };
  }

  if (
    /fish|prawn|shrimp|crab|lobster|salmon|tuna|squid|octopus|mussel|oyster/.test(name) ||
    category.includes("seafood")
  ) {
    return {
      title: "Discover the Seafood Tradition",
      origin:
        `${area} has its own seafood traditions. Fish and shellfish dishes vary according to local ingredients and cooking methods.`,
      background:
        "Seafood dishes use fish, shellfish or other marine ingredients as their main component.",
      preparation:
        "The seafood is cleaned and prepared before cooking. Seasonings, herbs and sauces are arranged according to the dish.",
      ingredients:
        "Fish or shellfish provides the main ingredient. Herbs, spices, citrus, vegetables and sauces develop the flavour.",
      stages: [
        "The seafood is cleaned and prepared.",
        "Herbs, spices and other seasonings are arranged.",
        "The seafood is seasoned according to the recipe.",
        "The selected cooking method is used to prepare the seafood.",
        "Sauces, herbs or finishing ingredients complete the dish.",
      ],
      flavour:
        "Seafood can have a delicate, savoury or rich flavour depending on the variety and seasonings.",
      culture:
        "Coastal communities around the world have developed distinctive seafood dishes.",
      cookingMethod: "Grilling, steaming, frying or simmering",
    };
  }

  if (name.includes("chicken") || category.includes("chicken")) {
    return {
      title: "The Preparation Behind Chicken Dishes",
      origin:
        `${area} offers its own chicken preparations, with different spice combinations, sauces and cooking techniques.`,
      background:
        "Chicken is a versatile ingredient used in many cuisines.",
      preparation:
        "The chicken is cleaned and cut into suitable portions. It may be seasoned or marinated before being cooked.",
      ingredients:
        "Chicken is the main ingredient. Onions, garlic, ginger, herbs, spices and sauces contribute additional flavour.",
      stages: [
        "The chicken is cleaned and divided into suitable portions.",
        "Spices, herbs and other seasoning ingredients are prepared.",
        "The chicken is seasoned or marinated when required.",
        "The chicken is cooked using the method suited to the dish.",
        "The sauce, herbs or finishing ingredients complete the preparation.",
      ],
      flavour:
        "Chicken dishes can be mild, spicy, creamy, smoky or aromatic.",
      culture:
        "Chicken dishes are popular across many food cultures, with regional variations.",
      cookingMethod: "Grilling, roasting, frying or simmering",
    };
  }

  if (category.includes("salad") || name.includes("salad")) {
    return {
      title: "Freshness Behind Every Salad",
      origin:
        `${area} has its own salad traditions, using seasonal vegetables, fruits, herbs and dressings.`,
      background:
        "Salads bring together fresh or prepared ingredients in different combinations.",
      preparation:
        "Vegetables and other ingredients are cleaned and cut. A dressing is prepared separately and combined with the ingredients.",
      ingredients:
        "Fresh vegetables, fruits, herbs, grains, nuts and dressings may be used.",
      stages: [
        "Fresh ingredients are selected and cleaned.",
        "Vegetables and fruits are cut into suitable portions.",
        "Herbs, toppings and other ingredients are prepared.",
        "A dressing is mixed using the selected ingredients.",
        "Everything is combined and arranged for serving.",
      ],
      flavour:
        "Salads often balance crisp textures, fresh flavours, natural sweetness and tangy dressings.",
      culture:
        "Salads are enjoyed in many cuisines, from Mediterranean vegetable salads to Asian-style combinations.",
      cookingMethod: "Fresh preparation and ingredient mixing",
    };
  }

  if (
    category.includes("dessert") ||
    /cake|ice cream|pudding|brownie|cookie|mousse|tart|pie/.test(name)
  ) {
    return {
      title: "The Sweet Story Behind This Dessert",
      origin:
        `${area} has its own dessert traditions, ingredients and methods of preparation.`,
      background:
        "Desserts bring together ingredients such as flour, sugar, milk, cream, fruits and chocolate.",
      preparation:
        "The ingredients are measured and prepared according to the dessert type. They are mixed, cooked, baked or chilled as needed.",
      ingredients:
        "Ingredients may include flour, sugar, milk, cream, eggs, fruits, chocolate and flavourings.",
      stages: [
        "The required ingredients are measured and prepared.",
        "Dry and wet ingredients are combined when required.",
        "The mixture is cooked, baked, chilled or set.",
        "The prepared dessert is allowed to reach the required texture.",
        "The final presentation is completed with suitable toppings.",
      ],
      flavour:
        "Desserts can combine sweetness, creaminess, fruitiness and rich flavours.",
      culture:
        "Desserts are part of celebrations and everyday food traditions across the world.",
      cookingMethod: "Mixing, baking, chilling or setting",
    };
  }

  if (category.includes("soup") || name.includes("soup")) {
    return {
      title: "How This Soup Comes Together",
      origin:
        `${area} has its own soup traditions, using local vegetables, herbs, spices and broths.`,
      background:
        "Soup combines ingredients in a liquid base to develop flavour and texture.",
      preparation:
        "The vegetables and other ingredients are prepared before being added to the broth or cooking liquid.",
      ingredients:
        "Vegetables, herbs, spices, stock, water and optional meat or dairy products may be used.",
      stages: [
        "Vegetables and other ingredients are cleaned and cut.",
        "A broth or seasoned liquid is prepared.",
        "The ingredients are added to the cooking liquid.",
        "Everything is simmered until the ingredients are cooked.",
        "Seasoning and finishing ingredients complete the soup.",
      ],
      flavour:
        "Soups can be light, savoury, spicy, creamy or rich.",
      culture:
        "Soup is enjoyed in many cultures, from traditional broths to regional vegetable and seafood soups.",
      cookingMethod: "Simmering and slow cooking",
    };
  }

  return {
    title: `Discover ${recipe.strMeal}`,
    origin: recipe.strArea
      ? `${recipe.strMeal} is associated with ${recipe.strArea} cuisine. The region's food traditions help shape the ingredients and preparation style of this dish.`
      : "This dish can be explored through its ingredients, food category and preparation method.",
    background:
      `${recipe.strMeal} belongs to the ${recipe.strCategory || "food"} category. Its character comes from the combination of ingredients and the way they are prepared.`,
    preparation:
      `The ingredients for ${recipe.strMeal} are prepared according to the recipe. They are then combined and cooked using the method described in the original preparation.`,
    ingredients:
      "The ingredients listed below form the foundation of this dish. Each ingredient contributes its own flavour, texture or aroma.",
    stages: [
      "The ingredients are selected and prepared.",
      "The required vegetables, herbs and seasonings are arranged.",
      "The main ingredients are combined according to the recipe.",
      "The dish is cooked using the required preparation method.",
      "The final ingredients and seasonings complete the dish.",
    ],
    flavour:
      `The flavour of ${recipe.strMeal} depends on its ingredients, seasoning and cooking method.`,
    culture: recipe.strArea
      ? `${recipe.strArea} cuisine includes different traditional dishes and preparation styles. This recipe represents one part of that culinary variety.`
      : "Food traditions differ between regions, and recipes often reflect local ingredients and preparation styles.",
    cookingMethod: "Recipe-specific preparation",
  };
}

// ==========================================
// COMPONENT
// ==========================================

export default function ProductDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const recipeId = searchParams.get("id");

  const [recipe, setRecipe] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addedToCart, setAddedToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");

  const recipePrice = recipe
    ? getRecipePrice(
        recipe.idMeal,
        recipe.strMeal,
        recipe.strCategory
      )
    : 0;

  // ==========================================
  // FETCH RECIPE DETAILS
  // ==========================================

  useEffect(() => {
    if (!recipeId) {
      setRecipe(null);
      setError("Recipe ID is missing.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchRecipe = async () => {
      setLoading(true);
      setError("");
      setRecipe(null);

      try {
        const response = await fetch(
          `/api/recipe/${encodeURIComponent(recipeId)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data: MealResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load recipe details."
          );
        }

        if (!Array.isArray(data.meals) || data.meals.length === 0) {
          throw new Error("Recipe not found.");
        }

        const foundRecipe = data.meals[0];

        if (!foundRecipe?.idMeal || !foundRecipe?.strMeal) {
          throw new Error("Invalid recipe information received.");
        }

        setRecipe(foundRecipe);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRecipe();

    return () => {
      controller.abort();
    };
  }, [recipeId]);

  // ==========================================
  // FOOD INFORMATION
  // ==========================================

  const foodProfile = recipe ? getFoodProfile(recipe) : null;
  const ingredients = recipe ? getIngredients(recipe) : [];

  // ==========================================
  // CHECK WISHLIST STATUS
  // ==========================================

  useEffect(() => {
    if (!recipe) return;

    const wishlist = readStorage<WishlistItem[]>(
      WISHLIST_KEY,
      []
    );

    setIsWishlisted(
      wishlist.some((item) => item.idMeal === recipe.idMeal)
    );
  }, [recipe]);

  // ==========================================
  // RECIPE TAGS
  // ==========================================

  const recipeTags = recipe?.strTags
    ? recipe.strTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  // ==========================================
  // ADD / REMOVE FROM WISHLIST
  // ==========================================

  const handleToggleWishlist = () => {
    if (!recipe) return;

    const wishlist = readStorage<WishlistItem[]>(
      WISHLIST_KEY,
      []
    );

    const existingItem = wishlist.some(
      (item) => item.idMeal === recipe.idMeal
    );

    const updatedWishlist = existingItem
      ? wishlist.filter((item) => item.idMeal !== recipe.idMeal)
      : [
          ...wishlist,
          {
            idMeal: recipe.idMeal,
            strMeal: recipe.strMeal,
            strMealThumb: recipe.strMealThumb,
            price: recipePrice,
          },
        ];

    if (!writeStorage(WISHLIST_KEY, updatedWishlist)) {
      setWishlistMessage(
        "Unable to update wishlist. Please try again."
      );
      return;
    }

    setIsWishlisted(!existingItem);

    setWishlistMessage(
      existingItem
        ? "Recipe removed from your wishlist."
        : "Recipe added to your wishlist!"
    );

    window.setTimeout(() => {
      setWishlistMessage("");
    }, 3500);
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = () => {
    if (!recipe) return;

    const cart = readStorage<CartItem[]>(CART_KEY, []);

    const existingItem = cart.find(
      (item) => item.idMeal === recipe.idMeal
    );

    const updatedCart = existingItem
      ? cart.map((item) =>
          item.idMeal === recipe.idMeal
            ? {
                ...item,
                price: recipePrice,
                quantity: Math.max(
                  1,
                  Number(item.quantity || 0)
                ) + 1,
              }
            : item
        )
      : [
          ...cart,
          {
            idMeal: recipe.idMeal,
            strMeal: recipe.strMeal,
            strMealThumb: recipe.strMealThumb,
            price: recipePrice,
            quantity: 1,
          },
        ];

    if (!writeStorage(CART_KEY, updatedCart)) {
      setCartMessage(
        "Unable to add recipe. Please check your browser storage."
      );
      setAddedToCart(false);
      return;
    }

    setAddedToCart(true);

    setCartMessage(
      existingItem
        ? "Recipe quantity updated in your cart!"
        : "Recipe successfully added to your cart!"
    );

    window.setTimeout(() => {
      setAddedToCart(false);
      setCartMessage("");
    }, 4000);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="details-loading">
          <div className="details-spinner" />
          <h2>Preparing Your Recipe</h2>
          <p>Finding delicious details for you...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !recipe || !foodProfile) {
    return (
      <main className="product-details-page">
        <div className="details-error">
          <AlertCircle size={48} />

          <h2>Recipe Not Found</h2>

          <p>{error || "Unable to find this recipe."}</p>

          <button
            type="button"
            onClick={() => router.push("/categories")}
          >
            <ArrowLeft size={18} />
            Back to Categories
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="product-details-page">

      {/* HEADER */}

      <header className="details-header">
        <Link href="/home" className="details-brand">
          <ChefHat size={27} />
          <span>Foodie</span>
        </Link>

        <nav
          className="details-navigation"
          aria-label="Food navigation"
        >
          <Link href="/categories" className="details-back">
            <ArrowLeft size={18} />
            Back to Categories
          </Link>
        </nav>
      </header>

      {/* RECIPE HERO */}

      <section className="details-hero">
        <div className="details-image-wrapper">
          <div className="food-image-box">
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              loading="eager"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          </div>
        </div>

        <div className="details-hero-content">
          <span className="details-label">
            <Utensils size={15} />
            FOODIE RECIPE
          </span>

          <h1>{recipe.strMeal}</h1>

          <p>
            Discover the ingredients, preparation style and
            culinary traditions behind {recipe.strMeal}.
          </p>

          <div className="details-recipe-price">
            <strong>₹{recipePrice}</strong>
          </div>

          <div className="details-meta">
            <span>
              <ChefHat size={18} />
              {recipe.strCategory || "Recipe"}
            </span>

            <span>
              <MapPin size={18} />
              {recipe.strArea || "International"}
            </span>

            <span>
              <Sparkles size={18} />
              Food Discovery
            </span>
          </div>

          {recipeTags.length > 0 && (
            <div className="details-tags">
              {recipeTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          {/* WISHLIST + CART ACTIONS */}

          <div className="details-cart-actions">
            <button
              type="button"
              className={`details-wishlist-btn ${
                isWishlisted ? "active" : ""
              }`}
              onClick={handleToggleWishlist}
              aria-pressed={isWishlisted}
            >
              <Heart
                size={19}
                fill={isWishlisted ? "currentColor" : "none"}
              />

              {isWishlisted
                ? "Remove from Wishlist"
                : "Add to Wishlist"}
            </button>

            <button
              type="button"
              className="details-add-cart"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={19} />
              Add to Cart
              <Plus size={17} />
            </button>

            <Link
              href="/cart"
              className="details-view-cart"
            >
              <ShoppingCart size={18} />
              View Cart
            </Link>

            <Link
              href="/wishlist"
              className="details-view-wishlist"
            >
              <Heart size={18} />
              View Wishlist
            </Link>
          </div>

          {cartMessage && (
            <div
              className={`details-cart-message ${
                addedToCart ? "success" : "error"
              }`}
              role="status"
            >
              <CheckCircle2 size={18} />
              <span>{cartMessage}</span>
            </div>
          )}

          {wishlistMessage && (
            <div
              className="details-wishlist-message"
              role="status"
            >
              <CheckCircle2 size={18} />
              <span>{wishlistMessage}</span>
            </div>
          )}
        </div>
      </section>

      {/* FOOD BACKGROUND */}

      <section className="details-section recipe-curiosity-section">
        <div className="details-section-heading">
          <span>FOOD BACKGROUND</span>
          <h2>{foodProfile.title}</h2>

          <p>
            Learn about the food traditions, ingredients and
            preparation that make {recipe.strMeal} special.
          </p>
        </div>

        <div className="recipe-curiosity-grid">
          <article className="recipe-curiosity-card">
            <div className="recipe-curiosity-icon">
              <BookOpen size={25} />
            </div>

            <h3>About This Dish</h3>
            <p>{foodProfile.background}</p>
          </article>

          <article className="recipe-curiosity-card">
            <div className="recipe-curiosity-icon">
              <Globe2 size={25} />
            </div>

            <h3>Origin & Famous Regions</h3>
            <p>{foodProfile.origin}</p>
          </article>

          <article className="recipe-curiosity-card">
            <div className="recipe-curiosity-icon">
              <Sparkles size={25} />
            </div>

            <h3>Flavour & Texture</h3>
            <p>{foodProfile.flavour}</p>
          </article>

          <article className="recipe-curiosity-card recipe-curiosity-highlight">
            <div className="recipe-curiosity-icon">
              <Coffee size={25} />
            </div>

            <h3>Food Culture</h3>
            <p>{foodProfile.culture}</p>
          </article>
        </div>
      </section>

      {/* INGREDIENTS */}

      <section className="details-section recipe-ingredients-section">
        <div className="details-section-heading">
          <span>WHAT GOES INTO IT</span>
          <h2>Ingredients Behind the Dish</h2>

          <p>
            Take a closer look at the ingredients that give
            {` ${recipe.strMeal} `}its flavour, aroma and character.
          </p>
        </div>

        {ingredients.length > 0 ? (
          <div className="ingredients-grid">
            {ingredients.map((ingredient, index) => (
              <article
                className="ingredient-card"
                key={`${ingredient.name}-${index}`}
              >
                <div className="ingredient-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="ingredient-content">
                  <h3>{ingredient.name}</h3>

                  {ingredient.measure && (
                    <p>{ingredient.measure}</p>
                  )}
                </div>

                <Leaf
                  size={20}
                  className="ingredient-icon"
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="recipe-curiosity-note">
            <Info size={20} />
            <p>
              Ingredient information is not available for this dish.
            </p>
          </div>
        )}
      </section>

      {/* PREPARATION EXPERIENCE */}

      <section className="details-section preparation-section">
        <div className="details-section-heading">
          <span>BEHIND THE PREPARATION</span>
          <h2>How This Dish Comes Together</h2>

          <p>
            See how the ingredients are prepared, combined and
            cooked to create {recipe.strMeal}.
          </p>
        </div>

        <div className="preparation-overview-card">
          <div className="preparation-overview-icon">
            <CookingPot size={30} />
          </div>

          <div>
            <span>PREPARATION OVERVIEW</span>
            <h3>{recipe.strMeal}</h3>
            <p>{foodProfile.preparation}</p>
          </div>
        </div>

        <div className="preparation-method-card">
          <div className="preparation-method-icon">
            <Flame size={23} />
          </div>

          <div>
            <span>COOKING STYLE</span>
            <h3>{foodProfile.cookingMethod}</h3>
          </div>
        </div>

        <div className="preparation-stages">
          {foodProfile.stages.map((stage, index) => (
            <article
              className="preparation-stage-card"
              key={`${stage}-${index}`}
            >
              <div className="preparation-stage-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="preparation-stage-content">
                <span>
                  PREPARATION STAGE {index + 1}
                </span>

                <p>{stage}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ORIGINAL RECIPE PREPARATION */}

      {recipe.strInstructions && (
        <section className="details-section original-preparation-section">
          <div className="details-section-heading">
            <span>RECIPE DETAILS</span>
            <h2>Original Preparation Notes</h2>
            <p>
              The preparation details provided for this dish.
            </p>
          </div>

          <div className="original-preparation-content">
            <BookOpen size={25} />
            <p>{recipe.strInstructions}</p>
          </div>
        </section>
      )}

      {/* FOOTER CTA */}

      <section className="details-bottom">
        <h2>Ready to Discover More?</h2>

        <p>
          Explore more dishes, ingredients and food traditions with Foodie.
        </p>

        <Link href="/categories">
          <ArrowLeft size={18} />
          Explore More Recipes
        </Link>
      </section>
    </main>
  );
}
