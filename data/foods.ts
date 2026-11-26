import type { Food } from "@/types/food";

export const foods: Food[] = [
  // BURGERS
  {
    name: "Chicken Burger",
    price: "â‚¹199",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85",
    tag: "BEST SELLER",
    category: "Burgers",
  },
  {
    name: "Classic Veg Burger",
    price: "â‚¹149",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "Burgers",
  },
  {
    name: "Cheese Burger",
    price: "â‚¹219",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85",
    tag: "MUST TRY",
    category: "Burgers",
  },

  // PIZZA
  {
    name: "Italian Pizza",
    price: "â‚¹249",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "Pizza",
  },
  {
    name: "Margherita Pizza",
    price: "â‚¹199",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=85",
    tag: "CLASSIC",
    category: "Pizza",
  },
  {
    name: "Pepperoni Pizza",
    price: "â‚¹299",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=85",
    tag: "BEST SELLER",
    category: "Pizza",
  },

  // PASTA
  {
    name: "Creamy Pasta",
    price: "â‚¹179",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=85",
    tag: "MUST TRY",
    category: "Pasta",
  },
  {
    name: "White Sauce Pasta",
    price: "â‚¹199",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "Pasta",
  },
  {
    name: "Red Sauce Pasta",
    price: "â‚¹189",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=85",
    tag: "CHEF SPECIAL",
    category: "Pasta",
  },

  // BIRYANI
  {
    name: "Chicken Biryani",
    price: "â‚¹249",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=85",
    tag: "BEST SELLER",
    category: "Biryani",
  },
  {
    name: "Mutton Biryani",
    price: "â‚¹329",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=85",
    tag: "SPECIAL",
    category: "Biryani",
  },
  {
    name: "Veg Biryani",
    price: "â‚¹179",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=85",
    tag: "VEG",
    category: "Biryani",
  },

  // SOUTH INDIAN
  {
    name: "Masala Dosa",
    price: "â‚¹99",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "South Indian",
  },
  {
    name: "Idli Sambar",
    price: "â‚¹69",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=85",
    tag: "HEALTHY",
    category: "South Indian",
  },
  {
    name: "Crispy Medu Vada",
    price: "â‚¹79",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=85",
    tag: "FRESH",
    category: "South Indian",
  },

  // INDIAN MEALS
  {
    name: "South Indian Meals",
    price: "â‚¹149",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "Indian Meals",
  },
  {
    name: "North Indian Thali",
    price: "â‚¹199",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85",
    tag: "FULL MEAL",
    category: "Indian Meals",
  },
  {
    name: "Paneer Butter Masala",
    price: "â‚¹219",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=85",
    tag: "CHEF SPECIAL",
    category: "Indian Meals",
  },

  // CHINESE
  {
    name: "Veg Fried Rice",
    price: "â‚¹149",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "Chinese",
  },
  {
    name: "Hakka Noodles",
    price: "â‚¹159",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=85",
    tag: "MUST TRY",
    category: "Chinese",
  },
  {
    name: "Chicken Manchurian",
    price: "â‚¹229",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=85",
    tag: "SPICY",
    category: "Chinese",
  },

  // STARTERS
  {
    name: "Chicken 65",
    price: "â‚¹189",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=85",
    tag: "BEST SELLER",
    category: "Starters",
  },
  {
    name: "Paneer Tikka",
    price: "â‚¹179",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=85",
    tag: "VEG SPECIAL",
    category: "Starters",
  },
  {
    name: "Tandoori Chicken",
    price: "â‚¹279",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=85",
    tag: "CHEF SPECIAL",
    category: "Starters",
  },

  // SANDWICHES & WRAPS
  {
    name: "Club Sandwich",
    price: "â‚¹149",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "Sandwiches",
  },
  {
    name: "Chicken Wrap",
    price: "â‚¹169",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=85",
    tag: "MUST TRY",
    category: "Sandwiches",
  },
  {
    name: "Veg Grilled Sandwich",
    price: "â‚¹119",
    rating: "4.4",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85",
    tag: "VEG",
    category: "Sandwiches",
  },

  // DESSERTS
  {
    name: "Chocolate Cake",
    price: "â‚¹129",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85",
    tag: "BEST SELLER",
    category: "Desserts",
  },
  {
    name: "Chocolate Brownie",
    price: "â‚¹99",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=85",
    tag: "MUST TRY",
    category: "Desserts",
  },
  {
    name: "Vanilla Ice Cream",
    price: "â‚¹79",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "Desserts",
  },

  // BEVERAGES
  {
    name: "Fresh Orange Juice",
    price: "â‚¹89",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=85",
    tag: "FRESH",
    category: "Beverages",
  },
  {
    name: "Chocolate Milkshake",
    price: "â‚¹119",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "Beverages",
  },
  {
    name: "Cold Coffee",
    price: "â‚¹99",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=85",
    tag: "MUST TRY",
    category: "Beverages",
  },

  // SNACKS
  {
    name: "French Fries",
    price: "â‚¹99",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=85",
    tag: "POPULAR",
    category: "Snacks",
  },
  {
    name: "Crispy Samosa",
    price: "â‚¹49",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85",
    tag: "CLASSIC",
    category: "Snacks",
  },
  {
    name: "Chicken Nuggets",
    price: "â‚¹159",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=85",
    tag: "CRISPY",
    category: "Snacks",
  },
];
