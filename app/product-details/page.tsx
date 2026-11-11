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
// RECIPE PRICE
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

  // GENERATE CONSISTENT PRICE USING RECIPE ID

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

  // BIRYANI

  if (name.includes("biryani")) {
    return {
      title: "The Story Behind Biryani",
      origin:
        "Biryani is strongly associated with the Indian subcontinent. Hyderabad, Lucknow, Kolkata and other regions are especially famous for their distinctive biryani styles.",
      background:
        "Biryani brings together aromatic rice, spices and carefully prepared ingredients. Different regions have developed their own versions, with variations in rice, seasoning and cooking techniques.",
      preparation:
        "The preparation often begins with washing and soaking rice. Meat or vegetables are seasoned separately, while aromatic spices develop the base flavour. The rice and prepared ingredients are then layered or combined and cooked until their flavours come together.",
      ingredients:
        "Rice provides the foundation of the dish. Whole spices, herbs, onions and other seasonings contribute aroma and depth. Depending on the variation, chicken, meat, eggs or vegetables provide the main component.",
      stages: [
        "Rice is washed and soaked before cooking to help achieve a suitable texture.",
        "Spices, onions and herbs are prepared to build the aromatic flavour base.",
        "The main ingredients are seasoned and cooked with the selected spices.",
        "Rice and the prepared ingredients are layered or combined according to the regional style.",
        "The dish is cooked until the rice is tender and the flavours are well combined.",
      ],
      flavour:
        "Biryani is known for its aromatic spices, fragrant rice and combination of savoury, herbal and mildly sweet notes. Its exact flavour depends on the regional recipe.",
      culture:
        "Hyderabadi, Lucknowi and Kolkata biryani are among the best-known regional varieties. Biryani is commonly served at celebrations, family gatherings and special occasions.",
      cookingMethod: "Rice cooking and aromatic layering",
    };
  }

  // RICE DISHES

  if (
    /rice|pulao|pilaf|risotto|fried rice/.test(name) ||
    category.includes("rice")
  ) {
    return {
      title: "The World of Rice Dishes",
      origin:
        "Rice dishes are popular across Asia, the Middle East, Europe and many other regions. Their ingredients and preparation methods vary according to local food traditions.",
      background:
        "Rice is a versatile staple that absorbs flavours from spices, vegetables, sauces and other ingredients. Different rice varieties create different textures and cooking results.",
      preparation:
        "Rice is usually cleaned and prepared before cooking. Depending on the dish, it may be boiled separately, cooked with a seasoned liquid or stir-fried with other ingredients.",
      ingredients:
        "Rice is the main ingredient, while vegetables, herbs, spices, sauces and proteins provide additional flavour and texture.",
      stages: [
        "Rice is selected and cleaned to prepare it for cooking.",
        "Vegetables, herbs and other ingredients are cut and arranged.",
        "Spices, sauces or aromatic ingredients are prepared to develop the flavour.",
        "Rice is cooked using the method suitable for the dish.",
        "The remaining ingredients are combined with the rice to complete the dish.",
      ],
      flavour:
        "Rice dishes can range from mild and fragrant to spicy, savoury or creamy depending on their ingredients and cooking style.",
      culture:
        "Rice has an important place in everyday meals and traditional celebrations in countries such as India, China, Japan, Thailand and many others.",
      cookingMethod: "Boiling, steaming or stir-frying",
    };
  }

  // PIZZA

  if (name.includes("pizza")) {
    return {
      title: "The Story Behind Pizza",
      origin:
        "Modern pizza is especially associated with Naples, Italy, where the traditional Neapolitan style became famous.",
      background:
        "Pizza is built around a dough base topped with sauce, cheese and other ingredients. Over time, different regions have created their own styles and combinations.",
      preparation:
        "The dough is prepared and allowed to rise. A sauce is spread over the base, followed by cheese and selected toppings. The assembled pizza is baked until the crust develops colour and the toppings are cooked.",
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
        "Pizza combines a soft or crisp crust with savoury sauce, melted cheese and toppings. Its taste changes depending on the ingredients and style.",
      culture:
        "Naples is famous for traditional Neapolitan pizza. Italian pizza culture has influenced popular pizza styles around the world.",
      cookingMethod: "Dough preparation and oven baking",
    };
  }

  // PASTA

  if (/pasta|spaghetti|macaroni|lasagna|penne|fettuccine/.test(name)) {
    return {
      title: "Discover the World of Pasta",
      origin:
        "Pasta is closely associated with Italian cuisine, which has developed many regional pasta shapes, sauces and preparation traditions.",
      background:
        "Pasta comes in different shapes and sizes. Each shape works with different sauces and ingredients, creating a wide variety of dishes.",
      preparation:
        "Pasta is cooked in water until it reaches the desired texture. Meanwhile, a sauce is prepared using ingredients such as tomatoes, cheese, cream, herbs or vegetables. The cooked pasta is then combined with the sauce.",
      ingredients:
        "Pasta forms the base, while sauces, herbs, vegetables, cheese and optional meat create the character of the dish.",
      stages: [
        "The pasta shape is selected according to the dish.",
        "Water is heated and the pasta is cooked until it reaches the desired texture.",
        "The sauce is prepared using the selected ingredients.",
        "The cooked pasta is combined with the sauce.",
        "Herbs, cheese or other finishing ingredients complete the dish.",
      ],
      flavour:
        "Pasta can be creamy, tangy, cheesy, savoury or herbaceous depending on the sauce and accompanying ingredients.",
      culture:
        "Italy is famous for its regional pasta traditions. Different regions are known for distinctive shapes, sauces and combinations.",
      cookingMethod: "Boiling and sauce preparation",
    };
  }

  // BURGER

  if (name.includes("burger")) {
    return {
      title: "What Makes a Burger Special?",
      origin:
        "The modern hamburger is strongly associated with the United States, although its food history has influences from other parts of the world.",
      background:
        "A burger combines a bread bun with a filling and selected toppings. Different styles use different patties, sauces, vegetables and cheeses.",
      preparation:
        "The patty is prepared and cooked, while the bun and toppings are arranged separately. The cooked patty is placed between the bun layers with sauces and other ingredients.",
      ingredients:
        "A bun provides the base. The filling may include a meat or vegetable patty, cheese, lettuce, tomato, onion and sauces.",
      stages: [
        "The patty mixture or selected filling is prepared.",
        "The patty is shaped and seasoned.",
        "The patty is cooked until ready.",
        "The bun is prepared and lightly toasted when required.",
        "The patty, vegetables, cheese and sauces are assembled inside the bun.",
      ],
      flavour:
        "Burgers bring together soft bread, a savoury filling, fresh vegetables and sauces for a combination of textures and flavours.",
      culture:
        "Burgers are a popular part of American fast-food culture and have developed many international variations.",
      cookingMethod: "Grilling, pan-frying and assembly",
    };
  }

  // SEAFOOD

  if (
    /fish|prawn|shrimp|crab|lobster|salmon|tuna|squid|octopus|mussel|oyster/.test(name) ||
    category.includes("seafood")
  ) {
    return {
      title: "Discover the Seafood Tradition",
      origin:
        `${recipe.strArea || "Many coastal regions"} has its own seafood traditions. Fish and shellfish dishes vary according to local ingredients, seasonings and cooking methods.`,
      background:
        "Seafood dishes use fish, shellfish or other marine ingredients as their main component. Their preparation often focuses on balancing the natural flavour of the seafood with herbs and seasonings.",
      preparation:
        "The seafood is cleaned and prepared before cooking. Seasonings, herbs and sauces are arranged according to the dish. The seafood is then grilled, steamed, fried or simmered depending on the recipe.",
      ingredients:
        "Fish or shellfish provides the main ingredient. Herbs, spices, citrus, vegetables and sauces help develop the overall flavour.",
      stages: [
        "The seafood is cleaned and prepared.",
        "Herbs, spices and other seasonings are arranged.",
        "The seafood is seasoned according to the recipe.",
        "The selected cooking method is used to prepare the seafood.",
        "Sauces, herbs or finishing ingredients complete the dish.",
      ],
      flavour:
        "Seafood can have a delicate, savoury or rich flavour depending on the variety and the seasonings used.",
      culture:
        "Coastal communities around the world have developed distinctive seafood dishes using locally available fish and shellfish.",
      cookingMethod: "Grilling, steaming, frying or simmering",
    };
  }

  // CHICKEN DISHES

  if (name.includes("chicken") || category.includes("chicken")) {
    return {
      title: "The Preparation Behind Chicken Dishes",
      origin:
        `${recipe.strArea || "Different regional cuisines"} offers its own chicken preparations, with different spice combinations, sauces and cooking techniques.`,
      background:
        "Chicken is a versatile ingredient used in many cuisines. It can be prepared with spices, herbs, vegetables and sauces to create a wide range of dishes.",
      preparation:
        "The chicken is cleaned and cut into suitable portions. It may be seasoned or marinated before being cooked with the selected spices, sauce or other ingredients.",
      ingredients:
        "Chicken is the main ingredient. Depending on the recipe, onions, garlic, ginger, herbs, spices and sauces contribute additional flavour.",
      stages: [
        "The chicken is cleaned and divided into suitable portions.",
        "Spices, herbs and other seasoning ingredients are prepared.",
        "The chicken is seasoned or marinated when required.",
        "The chicken is cooked using the method suited to the dish.",
        "The sauce, herbs or finishing ingredients are combined to complete the preparation.",
      ],
      flavour:
        "Chicken dishes can be mild, spicy, creamy, smoky or aromatic depending on the ingredients and cooking method.",
      culture:
        "Chicken dishes are popular across many food cultures, with regional variations in seasoning, sauces and preparation.",
      cookingMethod: "Grilling, roasting, frying or simmering",
    };
  }

  // SALAD

  if (category.includes("salad") || name.includes("salad")) {
    return {
      title: "Freshness Behind Every Salad",
      origin:
        `${recipe.strArea || "International cuisines"} has its own salad traditions, using seasonal vegetables, fruits, herbs and dressings.`,
      background:
        "Salads bring together fresh or prepared ingredients in different combinations. Their identity often comes from the balance of freshness, texture and dressing.",
      preparation:
        "Vegetables and other ingredients are cleaned and cut into suitable sizes. A dressing is prepared separately and combined with the ingredients to bring the flavours together.",
      ingredients:
        "Fresh vegetables, fruits, herbs, grains, nuts and dressings may be used depending on the style of salad.",
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

  // DESSERT

  if (
    category.includes("dessert") ||
    /cake|ice cream|pudding|brownie|cookie|mousse|tart|pie/.test(name)
  ) {
    return {
      title: "The Sweet Story Behind This Dessert",
      origin:
        `${recipe.strArea || "Different regional cuisines"} has its own dessert traditions, ingredients and methods of preparation.`,
      background:
        "Desserts bring together ingredients such as flour, sugar, milk, cream, fruits and chocolate. Their preparation may involve baking, chilling, mixing or cooking.",
      preparation:
        "The ingredients are measured and prepared according to the dessert type. They are mixed, cooked, baked or chilled as needed before the final presentation.",
      ingredients:
        "Depending on the dessert, ingredients may include flour, sugar, milk, cream, eggs, fruits, chocolate and flavourings.",
      stages: [
        "The required ingredients are measured and prepared.",
        "Dry and wet ingredients are combined when the recipe requires it.",
        "The mixture is cooked, baked, chilled or set according to the dessert.",
        "The prepared dessert is allowed to reach the required texture.",
        "The final presentation is completed with suitable toppings or garnishes.",
      ],
      flavour:
        "Desserts can combine sweetness, creaminess, fruitiness and rich flavours, with textures ranging from soft and smooth to crisp.",
      culture:
        "Desserts are part of celebrations and everyday food traditions across the world, with many regions known for their own specialties.",
      cookingMethod: "Mixing, baking, chilling or setting",
    };
  }

  // SOUP

  if (category.includes("soup") || name.includes("soup")) {
    return {
      title: "How This Soup Comes Together",
      origin:
        `${recipe.strArea || "Different regional cuisines"} has its own soup traditions, using local vegetables, herbs, spices and broths.`,
      background:
        "Soup combines ingredients in a liquid base to develop flavour and texture. Some versions are light and clear, while others are thick and creamy.",
      preparation:
        "The vegetables and other ingredients are prepared before being added to the broth or cooking liquid. They are simmered together until their flavours develop.",
      ingredients:
        "Vegetables, herbs, spices, stock, water and optional meat or dairy products may be used depending on the soup.",
      stages: [
        "Vegetables and other ingredients are cleaned and cut.",
        "A broth or seasoned liquid is prepared.",
        "The ingredients are added to the cooking liquid.",
        "Everything is simmered until the ingredients are cooked.",
        "Seasoning and finishing ingredients complete the soup.",
      ],
      flavour:
        "Soups can be light, savoury, spicy, creamy or rich depending on the ingredients and preparation.",
      culture:
        "Soup is enjoyed in many cultures, from traditional broths to regional vegetable and seafood soups.",
      cookingMethod: "Simmering and slow cooking",
    };
  }

  // GENERAL FALLBACK

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

  // ==========================================
  // RECIPE PRICE
  // ==========================================

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

    let isMounted = true;

    const fetchRecipe = async () => {
      setLoading(true);
      setError("");
      setRecipe(null);

      try {
        const response = await fetch(
          `/api/recipe/${encodeURIComponent(recipeId)}`,
          { cache: "no-store" }
        );

        const data: MealResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load recipe details."
          );
        }

        if (!data.meals || data.meals.length === 0) {
          throw new Error("Recipe not found.");
        }

        if (isMounted) {
          setRecipe(data.meals[0]);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecipe();

    return () => {
      isMounted = false;
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

    try {
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);

      if (!savedWishlist) {
        setIsWishlisted(false);
        return;
      }

      const parsedWishlist: unknown = JSON.parse(savedWishlist);

      if (Array.isArray(parsedWishlist)) {
        const exists = parsedWishlist.some(
          (item: WishlistItem) => item.idMeal === recipe.idMeal
        );

        setIsWishlisted(exists);
      } else {
        setIsWishlisted(false);
      }
    } catch (error) {
      console.error("Unable to check wishlist:", error);
      setIsWishlisted(false);
    }
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

    try {
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);

      let wishlist: WishlistItem[] = [];

      if (savedWishlist) {
        const parsedWishlist: unknown = JSON.parse(savedWishlist);

        if (Array.isArray(parsedWishlist)) {
          wishlist = parsedWishlist as WishlistItem[];
        }
      }

      const existingItem = wishlist.some(
        (item) => item.idMeal === recipe.idMeal
      );

      if (existingItem) {
        wishlist = wishlist.filter(
          (item) => item.idMeal !== recipe.idMeal
        );

        setIsWishlisted(false);
        setWishlistMessage("Recipe removed from your wishlist.");
      } else {
        const newItem: WishlistItem = {
          idMeal: recipe.idMeal,
          strMeal: recipe.strMeal,
          strMealThumb: recipe.strMealThumb,
          price: recipePrice,
        };

        wishlist = [...wishlist, newItem];

        setIsWishlisted(true);
        setWishlistMessage("Recipe added to your wishlist!");
      }

      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));

      window.setTimeout(() => {
        setWishlistMessage("");
      }, 3500);
    } catch (error) {
      console.error("Unable to update wishlist:", error);
      setWishlistMessage(
        "Unable to update wishlist. Please try again."
      );
    }
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = () => {
    if (!recipe) return;

    try {
      const savedCart = localStorage.getItem(CART_KEY);

      let cart: CartItem[] = [];

      if (savedCart) {
        const parsedCart: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          cart = parsedCart as CartItem[];
        }
      }

      const existingItem = cart.find(
        (item) => item.idMeal === recipe.idMeal
      );

      if (existingItem) {
        cart = cart.map((item) =>
          item.idMeal === recipe.idMeal
            ? {
                ...item,
                price: recipePrice,
                quantity: Number(item.quantity || 0) + 1,
              }
            : item
        );

        setCartMessage("Recipe quantity updated in your cart!");
      } else {
        const newItem: CartItem = {
          idMeal: recipe.idMeal,
          strMeal: recipe.strMeal,
          strMealThumb: recipe.strMealThumb,
          price: recipePrice,
          quantity: 1,
        };

        cart = [...cart, newItem];

        setCartMessage("Recipe successfully added to your cart!");
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      setAddedToCart(true);

      window.setTimeout(() => {
        setAddedToCart(false);
        setCartMessage("");
      }, 4000);
    } catch (error) {
      console.error("Unable to add recipe to cart:", error);
      setCartMessage("Unable to add recipe. Please try again.");
      setAddedToCart(false);
    }
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

          <button onClick={() => router.push("/categories")}>
            <ArrowLeft size={18} />
            Back to Categories
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

        <nav className="details-navigation" aria-label="Food navigation">
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

          {/* UPDATED RECIPE PRICE */}

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

            <Link href="/cart" className="details-view-cart">
              <ShoppingCart size={18} />
              View Cart
            </Link>

            <Link href="/wishlist" className="details-view-wishlist">
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
            <div className="details-wishlist-message" role="status">
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
                  {ingredient.measure && <p>{ingredient.measure}</p>}
                </div>

                <Leaf size={20} className="ingredient-icon" />
              </article>
            ))}
          </div>
        ) : (
          <div className="recipe-curiosity-note">
            <Info size={20} />
            <p>Ingredient information is not available for this dish.</p>
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
                <span>PREPARATION STAGE {index + 1}</span>
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
            <p>The preparation details provided for this dish.</p>
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