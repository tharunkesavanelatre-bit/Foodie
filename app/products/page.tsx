"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Search,
  Utensils,
  ArrowRight,
  RefreshCw,
  ChefHat,
  AlertCircle,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";

import "./products.css";

// ==========================================
// TYPES
// ==========================================

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  [key: string]: string | undefined;
}

interface MealResponse {
  success: boolean;
  total: number;
  meals: Meal[];
  message?: string;
}

interface WishlistItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  price?: number;
}

type SortOption = "az" | "category" | "cuisine";

interface RecipeFilters {
  categories: string[];
  area: string;
  sort: SortOption;
}

// ==========================================
// CONSTANTS
// ==========================================

const WISHLIST_KEY = "foodie_wishlist";

const ITEMS_PER_PAGE = 12;

const DEFAULT_FILTERS: RecipeFilters = {
  categories: [],
  area: "All",
  sort: "az",
};

const RECIPE_CATEGORIES = [
  "Beef",
  "Breakfast",
  "Chicken",
  "Dessert",
  "Goat",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian",
];

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

  let hash = 0;

  for (let i = 0; i < recipeId.length; i++) {
    hash = (hash * 31 + recipeId.charCodeAt(i)) >>> 0;
  }

  const priceRange = maxPrice - minPrice + 1;

  return minPrice + (hash % priceRange);
}

// ==========================================
// GET ACTUAL INGREDIENTS
// ==========================================

function getIngredientsText(meal: Meal): string {
  const ingredients: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];

    if (ingredient?.trim()) {
      ingredients.push(ingredient.trim());
    }
  }

  return ingredients.join(" ");
}

// ==========================================
// URL FILTER HELPERS
// ==========================================

function getFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  const categories =
    params.get("category")?.split(",").filter(Boolean) || [];

  const validSorts: SortOption[] = [
    "az",
    "category",
    "cuisine",
  ];

  const urlSort = params.get("sort") as SortOption;

  const page = Number(params.get("page") || 1);

  return {
    search: params.get("q") || "",

    filters: {
      categories: categories.filter(
        (item) => item !== "All"
      ),

      area: params.get("area") || "All",

      sort: validSorts.includes(urlSort)
        ? urlSort
        : "az",
    },

    page:
      Number.isFinite(page) && page > 0
        ? Math.floor(page)
        : 1,
  };
}

// ==========================================
// PRODUCTS PAGE
// ==========================================

export default function ProductsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filters, setFilters] =
    useState<RecipeFilters>(DEFAULT_FILTERS);

  const [currentPage, setCurrentPage] = useState(1);

  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState(false);

  const [urlLoaded, setUrlLoaded] = useState(false);

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const [wishlistLoaded, setWishlistLoaded] = useState(false);

  // ==========================================
  // LOAD FILTERS FROM URL
  // ==========================================

  useEffect(() => {
    const loadUrlState = () => {
      const urlState = getFiltersFromUrl();

      setSearch(urlState.search);
      setDebouncedSearch(urlState.search);
      setFilters(urlState.filters);
      setCurrentPage(urlState.page);
      setUrlLoaded(true);
    };

    loadUrlState();

    window.addEventListener("popstate", loadUrlState);

    return () => {
      window.removeEventListener("popstate", loadUrlState);
    };
  }, []);

  // ==========================================
  // DEBOUNCED SEARCH
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ==========================================
  // SYNC FILTERS WITH URL
  // ==========================================

  useEffect(() => {
    if (!urlLoaded) return;

    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    }

    if (filters.categories.length > 0) {
      params.set(
        "category",
        filters.categories.join(",")
      );
    }

    if (filters.area !== "All") {
      params.set("area", filters.area);
    }

    if (filters.sort !== "az") {
      params.set("sort", filters.sort);
    }

    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }

    const query = params.toString();

    const newUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  }, [
    urlLoaded,
    debouncedSearch,
    filters,
    currentPage,
  ]);

  // ==========================================
  // LOAD WISHLIST
  // ==========================================

  useEffect(() => {
    try {
      const savedWishlist =
        localStorage.getItem(WISHLIST_KEY);

      if (savedWishlist) {
        const parsedWishlist: unknown =
          JSON.parse(savedWishlist);

        if (Array.isArray(parsedWishlist)) {
          const ids = parsedWishlist
            .filter(
              (item): item is WishlistItem =>
                typeof item?.idMeal === "string"
            )
            .map((item) => item.idMeal);

          // eslint-disable-next-line react-hooks/set-state-in-effect
          setWishlistIds(ids);
        }
      }
    } catch (error) {
      console.error("Unable to load wishlist:", error);
    } finally {
      setWishlistLoaded(true);
    }
  }, []);

  // ==========================================
  // FETCH RECIPES
  // ==========================================

  const fetchMeals = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/recipes", {
          cache: "no-store",
          signal,
        });

        if (!response.ok) {
          throw new Error(
            "Unable to fetch recipes. Please try again."
          );
        }

        const data: MealResponse = await response.json();

        if (!data.success || !Array.isArray(data.meals)) {
          throw new Error(
            data.message ||
              "Invalid recipe data received."
          );
        }

        setMeals(data.meals);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading recipes."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  // ==========================================
  // LOAD RECIPES ON MOUNT
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMeals(controller.signal);

    return () => controller.abort();
  }, [fetchMeals]);

  // ==========================================
  // TOGGLE WISHLIST
  // ==========================================

  const handleToggleWishlist = (meal: Meal) => {
    if (!wishlistLoaded) return;

    try {
      const savedWishlist =
        localStorage.getItem(WISHLIST_KEY);

      let wishlist: WishlistItem[] = [];

      if (savedWishlist) {
        const parsedWishlist: unknown =
          JSON.parse(savedWishlist);

        if (Array.isArray(parsedWishlist)) {
          wishlist = parsedWishlist as WishlistItem[];
        }
      }

      const alreadyExists = wishlist.some(
        (item) => item.idMeal === meal.idMeal
      );

      let updatedWishlist: WishlistItem[];

      if (alreadyExists) {
        updatedWishlist = wishlist.filter(
          (item) => item.idMeal !== meal.idMeal
        );
      } else {
        const newItem: WishlistItem = {
          idMeal: meal.idMeal,
          strMeal: meal.strMeal,
          strMealThumb: meal.strMealThumb,
          strCategory: meal.strCategory,
          price: getRecipePrice(
            meal.idMeal,
            meal.strMeal,
            meal.strCategory
          ),
        };

        updatedWishlist = [...wishlist, newItem];
      }

      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(updatedWishlist)
      );

      setWishlistIds(
        updatedWishlist.map((item) => item.idMeal)
      );
    } catch (error) {
      console.error("Unable to update wishlist:", error);
    }
  };

  // ==========================================
  // AVAILABLE CATEGORIES
  // ==========================================

  const categories = useMemo(() => {
    const availableCategories = new Set(
      meals
        .map((meal) => meal.strCategory?.trim())
        .filter((category): category is string =>
          Boolean(category)
        )
    );

    const orderedCategories = RECIPE_CATEGORIES.filter(
      (category) => availableCategories.has(category)
    );

    const otherCategories = Array.from(
      availableCategories
    )
      .filter(
        (category) =>
          !RECIPE_CATEGORIES.includes(category)
      )
      .sort((a, b) => a.localeCompare(b));

    return [...orderedCategories, ...otherCategories];
  }, [meals]);

  // ==========================================
  // AVAILABLE CUISINES
  // ==========================================

  const areas = useMemo(() => {
    return Array.from(
      new Set(
        meals
          .map((meal) => meal.strArea?.trim())
          .filter((area): area is string => Boolean(area))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [meals]);

  // ==========================================
  // UPDATE FILTERS
  // ==========================================

  const updateFilter = <K extends keyof RecipeFilters>(
    key: K,
    value: RecipeFilters[K]
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));

    setCurrentPage(1);
  };

  // ==========================================
  // MULTI-SELECT CATEGORY
  // ==========================================

  const handleCategoryToggle = (category: string) => {
    setFilters((previous) => {
      const exists = previous.categories.includes(category);

      return {
        ...previous,

        categories: exists
          ? previous.categories.filter(
              (item) => item !== category
            )
          : [...previous.categories, category],
      };
    });

    setCurrentPage(1);
  };

  const handleAllCategories = () => {
    updateFilter("categories", []);
  };

  // ==========================================
  // SEARCH AND FILTER RECIPES
  // ==========================================

  const filteredMeals = useMemo(() => {
    const result = meals.filter((meal) => {
      const searchText = debouncedSearch.toLowerCase();

      const ingredients = getIngredientsText(meal);

      const searchableText = [
        meal.strMeal,
        meal.strCategory || "",
        meal.strArea || "",
        ingredients,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText ||
        searchableText.includes(searchText);

      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(
          meal.strCategory || ""
        );

      const matchesArea =
        filters.area === "All" ||
        meal.strArea === filters.area;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesArea
      );
    });

    switch (filters.sort) {
      case "category":
        result.sort((a, b) => {
          const categoryComparison = (
            a.strCategory || ""
          ).localeCompare(b.strCategory || "");

          return (
            categoryComparison ||
            a.strMeal.localeCompare(b.strMeal)
          );
        });
        break;

      case "cuisine":
        result.sort((a, b) => {
          const areaComparison = (
            a.strArea || ""
          ).localeCompare(b.strArea || "");

          return (
            areaComparison ||
            a.strMeal.localeCompare(b.strMeal)
          );
        });
        break;

      case "az":
      default:
        result.sort((a, b) =>
          a.strMeal.localeCompare(b.strMeal)
        );
        break;
    }

    return result;
  }, [meals, debouncedSearch, filters]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMeals.length / ITEMS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedMeals = useMemo(() => {
    const start =
      (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredMeals.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredMeals, safeCurrentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ==========================================
  // ACTIVE FILTER COUNT
  // ==========================================

  const activeFilterCount =
    filters.categories.length +
    Number(filters.area !== "All") +
    Number(Boolean(debouncedSearch));

  // ==========================================
  // CLEAR ALL FILTERS
  // ==========================================

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // ==========================================
  // REMOVE INDIVIDUAL FILTER
  // ==========================================

  const removeFilter = (filter: string) => {
    switch (filter) {
      case "search":
        setSearch("");
        setDebouncedSearch("");
        setCurrentPage(1);
        break;

      case "area":
        updateFilter("area", "All");
        break;

      default:
        updateFilter(
          "categories",
          filters.categories.filter(
            (item) => item !== filter
          )
        );
    }
  };

  // ==========================================
  // ACTIVE FILTER TAGS
  // ==========================================

  const activeTags = useMemo(() => {
    const tags: {
      key: string;
      label: string;
    }[] = [];

    if (debouncedSearch) {
      tags.push({
        key: "search",
        label: `Search: ${debouncedSearch}`,
      });
    }

    filters.categories.forEach((category) => {
      tags.push({
        key: category,
        label: category,
      });
    });

    if (filters.area !== "All") {
      tags.push({
        key: "area",
        label: filters.area,
      });
    }

    return tags;
  }, [debouncedSearch, filters]);

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main className="products-page">

      {/* ==========================================
          PREMIUM PRODUCTS HERO
      ========================================== */}

      <section className="products-hero">

        <div className="products-hero-inner">

          {/* LEFT CONTENT */}

          <div className="products-hero-content">

            <span className="products-label">
              <ChefHat size={16} />
              FOODIE COLLECTION
            </span>

            <h1>
              Discover Delicious
              <span> Recipes</span>
            </h1>

            <p>
              Find your next favourite meal from our
              collection of delicious recipes. Fresh
              inspiration, amazing flavours, and something
              special for every food lover.
            </p>

            {/* SEARCH */}

            <div className="products-search">

              <Search size={20} />

              <input
                type="text"
                placeholder="Search recipes or ingredients..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                aria-label="Search recipes and ingredients"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  type="button"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}

            </div>

            {/* HERO HIGHLIGHTS */}

            <div className="products-hero-highlights">

              <span>
                <Utensils size={16} />
                Delicious Recipes
              </span>

              <span>
                <Heart size={16} />
                Save Your Favourites
              </span>

            </div>

          </div>

          {/* RIGHT IMAGE COLLAGE */}

          <div className="products-hero-visual">

            {/* Main Pasta Image */}

            <div className="products-hero-main-image">

              <img
                src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1100&q=90"
                alt="Fresh Italian pasta"
                fetchPriority="high"
              />

              <div className="products-image-caption">
                <span>FOODIE SELECTION</span>
                <strong>Made with Love</strong>
              </div>

            </div>

            {/* Pizza Image */}

            <div className="products-hero-food-card products-food-pizza">

              <img
                src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=450&q=85"
                alt="Freshly baked pizza"
              />

              <span>Pizza</span>

            </div>

            {/* Burger Image */}

            <div className="products-hero-food-card products-food-burger">

              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=450&q=85"
                alt="Delicious burger"
              />

              <span>Burgers</span>

            </div>

            {/* Salad Image */}

            <div className="products-hero-food-card products-food-salad">

              <img
                src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=450&q=85"
                alt="Fresh vegetable salad"
              />

              <span>Fresh & Healthy</span>

            </div>

            {/* Decorative Elements */}

            <div className="products-hero-decoration products-decoration-one">
              <ChefHat size={22} />
            </div>

            <div className="products-hero-decoration products-decoration-two">
              <Sparkles size={20} />
            </div>

            <div className="products-hero-sticker">
              <span>GOOD FOOD</span>
              <strong>GOOD MOOD!</strong>
            </div>

          </div>

        </div>

      </section>

      {/* ==========================================
          PRODUCTS CONTENT
      ========================================== */}

      <section className="products-content">

        {/* HEADING */}

        <div className="products-heading">

          <div>
            <span className="products-small-label">
              OUR MENU
            </span>

            <h2>Explore Recipes</h2>
          </div>

          <div className="products-heading-actions">

            <Link
              href="/categories"
              className="products-back-category-link"
            >
              <ArrowLeft size={17} />
              Back to Categories
            </Link>

            <Link
              href="/wishlist"
              className="products-wishlist-link"
            >
              <Heart size={17} />
              Wishlist
              <span>{wishlistIds.length}</span>
            </Link>

            <span className="products-count">
              {loading
                ? "Loading..."
                : `${filteredMeals.length} Recipes`}
            </span>

          </div>

        </div>

        {/* CATEGORY FILTER */}

        <div className="products-filter-section">

          <div className="products-filter-title">
            <h3>Categories</h3>
            <span>Select multiple categories</span>
          </div>

          <div className="products-categories">

            <button
              type="button"
              className={
                filters.categories.length === 0
                  ? "active"
                  : ""
              }
              onClick={handleAllCategories}
              aria-pressed={filters.categories.length === 0}
            >
              All
            </button>

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  filters.categories.includes(item)
                    ? "active"
                    : ""
                }
                onClick={() => handleCategoryToggle(item)}
                aria-pressed={filters.categories.includes(item)}
              >
                {item}

                {filters.categories.includes(item) && (
                  <Check size={14} />
                )}
              </button>
            ))}

          </div>

        </div>

        {/* ADVANCED FILTER TOGGLE */}

        <div className="products-advanced-toggle-wrapper">

          <button
            type="button"
            className={`products-advanced-toggle ${
              showAdvancedFilters ? "active" : ""
            }`}
            onClick={() =>
              setShowAdvancedFilters((previous) => !previous)
            }
            aria-expanded={showAdvancedFilters}
          >
            <SlidersHorizontal size={19} />

            Advanced Filters

            {activeFilterCount > 0 && (
              <span className="products-filter-badge">
                {activeFilterCount}
              </span>
            )}

            {showAdvancedFilters ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}

          </button>

          <div className="products-sort-control">

            <ArrowUpDown size={17} />

            <select
              value={filters.sort}
              onChange={(event) =>
                updateFilter(
                  "sort",
                  event.target.value as SortOption
                )
              }
              aria-label="Sort recipes"
            >
              <option value="az">Recipe Name: A – Z</option>
              <option value="category">Category</option>
              <option value="cuisine">Cuisine</option>
            </select>

          </div>

        </div>

        {/* ADVANCED FILTER PANEL */}

        {showAdvancedFilters && (
          <div className="products-advanced-panel">

            <div className="products-filter-control">

              <label htmlFor="recipe-area">
                <MapPin size={17} />
                Cuisine / Area
              </label>

              <select
                id="recipe-area"
                value={filters.area}
                onChange={(event) =>
                  updateFilter("area", event.target.value)
                }
              >
                <option value="All">All Cuisines</option>

                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}

              </select>

            </div>

            <button
              type="button"
              className="products-reset-advanced"
              onClick={resetFilters}
            >
              <RotateCcw size={16} />
              Clear All Filters
            </button>

          </div>
        )}

        {/* ACTIVE FILTERS */}

        {activeTags.length > 0 && (
          <div className="products-active-filters">

            <div className="products-active-heading">
              <span>Active Filters</span>

              <button
                type="button"
                onClick={resetFilters}
              >
                Clear All
              </button>
            </div>

            <div className="products-active-tags">

              {activeTags.map((tag) => (
                <button
                  type="button"
                  key={tag.key}
                  onClick={() => removeFilter(tag.key)}
                  aria-label={`Remove ${tag.label} filter`}
                >
                  {tag.label}
                  <X size={14} />
                </button>
              ))}

            </div>

          </div>
        )}

        {/* RESULT INFORMATION */}

        {!loading && !error && (
          <div className="products-result-info">

            <p>
              Showing{" "}
              <strong>{filteredMeals.length}</strong>{" "}
              recipes
            </p>

            {filteredMeals.length > 0 && (
              <span>
                Page {safeCurrentPage} of {totalPages}
              </span>
            )}

          </div>
        )}

        {/* LOADING SPINNER */}

        {loading ? (

          <div className="products-loading">

            <div className="products-spinner"></div>

            <h3>Loading Delicious Recipes...</h3>

            <p>
              Please wait while we prepare your collection.
            </p>

          </div>

        ) : error ? (

          /* ERROR */

          <div className="products-message">

            <AlertCircle size={35} />

            <h3>Unable to load recipes</h3>

            <p>{error}</p>

            <button
              onClick={() => fetchMeals()}
              type="button"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>

        ) : filteredMeals.length === 0 ? (

          /* EMPTY STATE */

          <div className="products-message">

            <Utensils size={35} />

            <h3>No recipes found</h3>

            <p>
              Try changing your search or selected filters.
            </p>

            <button
              onClick={resetFilters}
              type="button"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* RECIPE GRID */

          <div className="products-grid">

            {paginatedMeals.map((meal) => {

              const isWishlisted =
                wishlistIds.includes(meal.idMeal);

              const recipePrice = getRecipePrice(
                meal.idMeal,
                meal.strMeal,
                meal.strCategory
              );

              return (
                <article
                  className="product-card"
                  key={meal.idMeal}
                >

                  <div className="product-image">

                    <img
                      src={meal.strMealThumb}
                      alt={meal.strMeal}
                      loading="lazy"
                    />

                    <button
                      type="button"
                      className={`product-wishlist-btn ${
                        isWishlisted ? "active" : ""
                      }`}
                      onClick={() =>
                        handleToggleWishlist(meal)
                      }
                      aria-label={
                        isWishlisted
                          ? `Remove ${meal.strMeal} from wishlist`
                          : `Add ${meal.strMeal} to wishlist`
                      }
                      aria-pressed={isWishlisted}
                      disabled={!wishlistLoaded}
                    >
                      <Heart
                        size={20}
                        fill={
                          isWishlisted
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                  </div>

                  <div className="product-info">

                    <span className="product-category">
                      {meal.strCategory || "Recipe"}
                    </span>

                    <h3>{meal.strMeal}</h3>

                    <p>
                      {meal.strArea || "Delicious cuisine"}
                    </p>

                    <div className="product-price">
                      <strong>₹{recipePrice}</strong>
                    </div>

                    <Link
                      href={`/product-details?id=${meal.idMeal}`}
                      className="product-view-button"
                    >
                      View Recipe
                      <ArrowRight size={17} />
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>
        )}

        {/* PAGINATION */}

        {!loading &&
          !error &&
          filteredMeals.length > ITEMS_PER_PAGE && (

            <div className="products-pagination">

              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.max(1, previous - 1)
                  )
                }
                aria-label="Previous page"
              >
                <ChevronLeft size={19} />
                Previous
              </button>

              <div className="products-page-numbers">

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                )
                  .filter((page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - safeCurrentPage) <= 1
                  )
                  .map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={
                        safeCurrentPage === page
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      aria-label={`Page ${page}`}
                      aria-current={
                        safeCurrentPage === page
                          ? "page"
                          : undefined
                      }
                    >
                      {page}
                    </button>
                  ))}

              </div>

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(totalPages, previous + 1)
                  )
                }
                aria-label="Next page"
              >
                Next
                <ChevronRight size={19} />
              </button>

            </div>

          )}

      </section>

    </main>
  );
}
