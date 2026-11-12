# 🍔 FOODIE – Food Ordering Website

**FOODIE** is a modern and responsive food ordering web application built with Next.js, React, TypeScript, and CSS. It provides users with an interactive platform to discover food items, explore different categories, view recipe details, manage their wishlist and shopping cart, and complete a food ordering workflow.

The application focuses on delivering a smooth user experience through a clean interface, creative animations, responsive layouts, and dynamic recipe data fetched from an external API.

---

## 🌟 Project Overview

FOODIE is designed to make online food discovery and ordering simple, convenient, and enjoyable.

Users can explore a wide collection of food recipes, browse food categories, search for their favourite dishes, view individual food details, add items to their cart, and proceed through the checkout process.

The application also includes order confirmation and order history pages to provide a complete food-ordering experience.

### 🎯 Main Objectives

- Build a modern food ordering website using Next.js.
- Display food items dynamically using an external recipe API.
- Provide smooth navigation between different pages.
- Implement cart and wishlist functionality.
- Create an interactive checkout and order confirmation experience.
- Develop a responsive user interface for desktop, tablet, and mobile devices.
- Improve usability through animations, icons, loading indicators, and interactive components.

---

## 🚀 Key Features

### 1. 🏠 Home Page
- Attractive hero section with a modern food-themed design.
- Engaging content and call-to-action buttons.
- Food discovery sections.
- Navigation to important website pages.
- Responsive layout and creative visual elements.

### 2. 📂 Categories Page
- Browse food items through different categories.
- Explore available food collections.
- Navigate between categories and related products.
- Interactive category cards and visual elements.

### 3. 🍕 Products Page
- Dynamically fetches food recipes from TheMealDB API.
- Displays food images and recipe information.
- Supports a large collection of food items.
- Search and explore available dishes.
- Provides navigation to individual product details.
- Includes loading and error-handling experiences.

### 4. 🔍 Product Details Page
- Displays individual food information.
- Shows food images and available recipe details.
- Provides ingredient information where available.
- Allows users to interact with the selected food item.
- Supports navigation to shopping-related pages.

### 5. ❤️ Wishlist
- Allows users to save their favourite food items.
- Provides a dedicated wishlist page.
- Makes it easier to revisit selected items.
- Supports wishlist management.

### 6. 🛒 Shopping Cart
- Add food items to the cart.
- View selected items.
- Manage cart quantities.
- Remove unwanted items.
- Review the selected items before checkout.

### 7. 💳 Checkout Page
- Displays selected food items and order information.
- Provides customer and delivery information fields.
- Calculates the order summary.
- Offers a structured checkout experience.
- Includes validation for required information.

### 8. 🎉 Order Success Page
- Displays an order confirmation experience.
- Shows relevant order information.
- Provides a clear indication that the order has been placed.
- Offers navigation to other website sections.

### 9. 📦 My Orders Page
- Provides access to order history.
- Displays previously placed orders.
- Shows order-related information.
- Includes an interactive order details experience.
- Uses a dedicated loading and empty-state design.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework and application routing |
| React | Building reusable user interface components |
| TypeScript | Type safety and maintainable code |
| JavaScript | Application functionality and interactions |
| CSS3 | Styling, animations, layouts, and responsive design |
| Tailwind CSS | Utility-based styling where used |
| Lucide React | Modern icons and visual elements |
| TheMealDB API | Fetching dynamic food recipe information |
| Git | Version control |
| GitHub | Source code management and repository hosting |

---

## 🔌 API Integration

FOODIE uses **TheMealDB API** to retrieve food recipe information dynamically.

**API Provider:** TheMealDB

**API Endpoint:**

`https://www.themealdb.com/api/json/v1/1`

### How API Integration Works

1. The frontend requests food information from the application's API endpoint.
2. The Next.js API route communicates with TheMealDB.
3. Recipe information is collected using the available search endpoints.
4. The application processes and combines the returned recipe data.
5. Duplicate recipes are removed using their unique meal IDs.
6. The processed recipe collection is returned to the frontend.
7. The Products page displays the available food items.

### Internal API Route

`/api/recipes`

### API Response Structure

```json
{
  "success": true,
  "total": 790,
  "meals": []
}
```

The total recipe count can vary depending on the API response.

### API Features

- Server-side API integration.
- Parallel recipe fetching in batches.
- Request timeout handling.
- HTTP response validation.
- Duplicate recipe removal.
- Error handling.
- Next.js data revalidation.

---

## 🎨 UI and Design

FOODIE follows a modern food-themed visual design.

### Design Highlights

- Luxury white and dramatic orange colour combination.
- Primary orange: `#EA580C`
- Dark orange: `#C2410C`
- Cream background: `#FFFAF6`
- Light orange: `#FFF2E9`
- Dark text: `#171717`
- Clean typography and structured layouts.
- Modern Lucide React icons.
- Creative CSS animations and transitions.
- Responsive page layouts.
- Interactive buttons and navigation elements.
- Dedicated loading, empty, and error states.

The design aims to create a visually appealing food discovery experience while keeping navigation simple and user-friendly.

---

## 📁 Project Structure

The application follows the Next.js App Router folder structure.

```text
foodie/
│
├── app/
│   │
│   ├── api/
│   │   └── recipes/
│   │       └── route.ts
│   │
│   ├── categories/
│   │
│   ├── products/
│   │
│   ├── product-details/
│   │
│   ├── cart/
│   │
│   ├── checkout/
│   │
│   ├── order-success/
│   │
│   ├── orders/
│   │   ├── page.tsx
│   │   └── orders.css
│   │
│   ├── wishlist/
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── public/
│   └── images and static assets
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

*Note: This is a simplified overview of the project structure. Individual pages may contain additional components, stylesheets, and supporting files.*

---

## ⚙️ Installation and Setup

Follow these steps to run FOODIE locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Visual Studio Code
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/tharunkesavanelatre-bit/Foodie.git
```

### Step 2: Navigate to the Project Folder

```bash
cd Foodie
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Open the Website

Visit the following address in your browser:

```text
http://localhost:3000
```

The application will be available locally.

---

## 📱 Responsive Design

FOODIE is designed to work across different screen sizes.

- Desktop computers
- Laptops
- Tablets
- Mobile devices

Responsive CSS layouts help maintain usability and visual consistency across different devices.

---

## 🔄 Application Workflow

The main food ordering workflow is:

```text
       HOME PAGE
           |
           v
     CATEGORIES PAGE
           |
           v
      PRODUCTS PAGE
           |
           v
   PRODUCT DETAILS PAGE
           |
           v
      ADD TO CART
           |
           v
       CART PAGE
           |
           v
     CHECKOUT PAGE
           |
           v
     ORDER SUCCESS
           |
           v
       MY ORDERS
```

Users can also access the Wishlist and navigate between different sections through the website navigation.

---

## 🔮 Future Enhancements

The following features can be considered for future development:

- User registration and authentication.
- Backend database integration.
- Real-time order tracking.
- Restaurant and delivery partner management.
- Advanced food filtering and sorting.
- User reviews and ratings.
- Online payment gateway integration.
- Admin dashboard for managing products and orders.
- Improved personalized food recommendations.
- Production deployment and performance optimization.

---

## 🎓 Learning Outcomes

Developing FOODIE provides practical experience with:

- Next.js App Router.
- React components and hooks.
- TypeScript fundamentals.
- API integration and data fetching.
- Server-side API routes.
- State management.
- Form handling and validation.
- Responsive CSS design.
- CSS animations and transitions.
- Git and GitHub workflows.
- Building a multi-page web application.

---

## 👨‍💻 Developer

**Developed by:** Tharun Kesavan

**Project Name:** FOODIE – Food Ordering Website

**Technology:** Next.js | React | TypeScript | CSS | TheMealDB API

---

## 📄 License

This project is developed for learning and demonstration purposes.

Food recipe data is provided by [TheMealDB](https://www.themealdb.com/).

---

⭐ **If you like this project, consider giving the repository a star!**

**FOODIE – Good Food. Good Mood! 🍔**
