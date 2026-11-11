"use client";

import "./hero.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowRight,
  Clock3,
  Heart,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  Star,
  X,
  ChevronRight,
  ChefHat,
} from "lucide-react";

// ==========================================
// LOCAL PLACEHOLDER DATA
// ==========================================

const stats = {
  foodOptions: 500,
  restaurants: 50,
  avgDeliveryMinutes: 30,
  rating: 4.9,
};

const placeholders = [
  "Search for pizza...",
  "Search for biryani...",
  "Search for burgers...",
  "Search for sushi...",
];

const navigation = [
  { label: "Home", href: "/home" },
  { label: "Categories", href: "/categories" },
  { label: "Explore Food", href: "/products" },
  { label: "My Orders", href: "/orders" },
];

const easeOutExpo = [0.16, 1, 0.3, 1];

// ==========================================
// COUNT-UP ANIMATION
// ==========================================

function AnimatedNumber({ value, suffix = "" }) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  const [count, setCount] = useState(0);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setCount(value);
      return;
    }

    const duration = 1600;
    const startTime = performance.now();

    let animationFrame;

    const updateCount = (currentTime) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const easedProgress = 1 - Math.pow(1 - progress, 4);

      setCount(
        Number.isInteger(value)
          ? Math.round(easedProgress * value)
          : Math.round(easedProgress * value * 10) / 10
      );

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, shouldReduceMotion]);

  return (
    <span ref={ref}>
      {Number.isInteger(value) ? Math.round(count) : count.toFixed(1)}
      {suffix}
    </span>
  );
}

// ==========================================
// HERO SECTION
// ==========================================

export default function HeroSection() {
  const router = useRouter();

  const shouldReduceMotion = useReducedMotion();

  const imageRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // ========================================
  // SEARCH PLACEHOLDER ANIMATION
  // ========================================

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setPlaceholderIndex(
        (previous) => (previous + 1) % placeholders.length
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // ========================================
  // 3D IMAGE TILT WITH SPRING PHYSICS
  // ========================================

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(mouseY, {
    stiffness: 150,
    damping: 20,
  });

  const rotateY = useSpring(mouseX, {
    stiffness: 150,
    damping: 20,
  });

  function handleMouseMove(event) {
    if (shouldReduceMotion || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    mouseX.set(((x - centerX) / centerX) * 12);
    mouseY.set(((centerY - y) / centerY) * 12);
  }

  function resetTilt() {
    mouseX.set(0);
    mouseY.set(0);
  }

  // ========================================
  // SEARCH SUBMISSION
  // ========================================

  function handleSearch(event) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    router.push(`/products?search=${encodeURIComponent(query)}`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF9F4] text-[#171717]">

      {/* HEADER */}

      <motion.header
        initial={shouldReduceMotion ? false : { opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOutExpo }}
        className="relative z-50 flex min-h-[82px] items-center justify-between border-b border-orange-100/70 bg-white/85 px-5 backdrop-blur-xl md:px-10 lg:px-[8%]"
      >
        {/* UPDATED FOODIE LOGO */}
        <Link
  href="/home"
  className="flex shrink-0 items-center gap-2"
>
  {/* Foodie Logo Icon */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className="h-11 w-11"
  >
    <defs>
      <linearGradient
        id="foodie-logo"
        x1="0"
        y1="0"
        x2="1"
        y2="1"
      >
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
    </defs>

    <rect
      width="64"
      height="64"
      rx="18"
      fill="url(#foodie-logo)"
    />

    <path
      d="M19 15v14M25 15v14M31 15v14M25 29v20"
      stroke="#ffffff"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />

    <path
      d="M44 15c-5 5-7 12-7 19h7v14"
      stroke="#ffffff"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>

  {/* Foodie Text */}
  <span className="text-[30px] font-black tracking-[-1.5px] text-[#171717]">
    Foodie<span className="text-[#EA580C]">.</span>
  </span>
</Link>

        {/* DESKTOP NAVIGATION */}

        <nav
          aria-label="Main"
          className="hidden items-center gap-8 md:flex"
        >
          {navigation.map((item, index) => (
            <motion.div
              key={item.label}
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: -12 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: shouldReduceMotion ? 0 : 0.15 + index * 0.1,
                duration: 0.5,
              }}
            >
              <Link
                href={item.href}
                aria-current={
                  item.href === "/home" ? "page" : undefined
                }
                className={`group relative py-2 text-sm font-medium transition-colors duration-300 ${
                  item.href === "/home"
                    ? "text-[#EA580C]"
                    : "text-gray-500 hover:text-[#171717]"
                }`}
              >
                {item.label}

                <span
                  className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#EA580C] transition-all duration-300 ${
                    item.href === "/home"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* HEADER ACTIONS */}

        <div className="flex items-center gap-3">

          <Link
            href="/wishlist"
            aria-label="Open wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-[#EA580C]"
          >
            <Heart size={19} />
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-full bg-[#EA580C] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-transform hover:scale-105 active:scale-95"
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">My Cart</span>
          </Link>

          <Link
            href="/profile"
            aria-label="Open user profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-[#EA580C] transition-transform hover:scale-105"
          >
            U
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 md:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              aria-label="Mobile navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute left-0 top-full w-full overflow-hidden border-b border-orange-100 bg-white px-6 shadow-xl md:hidden"
            >
              <div className="flex flex-col py-4">
                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`border-b border-gray-100 py-4 text-sm font-semibold ${
                      item.href === "/home"
                        ? "text-[#EA580C]"
                        : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ========================================
          EXISTING HERO CONTENT
      ======================================== */}

      <section className="relative isolate grid min-h-[680px] items-center gap-12 px-5 py-16 md:px-10 lg:grid-cols-2 lg:px-[8%] lg:py-20">

        {/* BACKGROUND GLOWS */}

        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 30, -15, 0],
                  y: [0, -20, 15, 0],
                }
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -left-32 top-20 -z-10 h-80 w-80 rounded-full bg-orange-200/40 blur-[100px]"
        />

        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -25, 20, 0],
                  y: [0, 20, -15, 0],
                }
          }
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-96 w-96 rounded-full bg-amber-100/70 blur-[110px]"
        />

        {/* LEFT CONTENT */}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.13 },
            },
          }}
          className="relative z-10 mx-auto w-full max-w-[650px] lg:mx-0"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: easeOutExpo },
              },
            }}
          >
            <span className="inline-flex items-center gap-3 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[10px] font-bold tracking-[1.5px] text-[#EA580C] sm:text-xs">
              <span className="relative flex h-2 w-2">
                {!shouldReduceMotion && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EA580C]" />
              </span>
              FRESH FOOD, HAPPY MOOD
            </span>
          </motion.div>

          {/* HEADLINE */}

          <motion.h1
            className="mt-7 text-[clamp(42px,6vw,76px)] font-black leading-[1.08] tracking-[-3px] sm:tracking-[-4px]"
            style={{ perspective: 1000 }}
          >
            <motion.span
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 60, rotateX: -45 }
              }
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.9, ease: easeOutExpo }}
              className="block"
            >
              Delicious food.
            </motion.span>

            <motion.span
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 60, rotateX: -45 }
              }
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.9,
                delay: shouldReduceMotion ? 0 : 0.2,
                ease: easeOutExpo,
              }}
              className="mt-1 block text-[#EA580C]"
            >
              Delivered with love.
            </motion.span>
          </motion.h1>

          {/* DESCRIPTION */}

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.45,
              duration: 0.7,
            }}
            className="mt-6 max-w-[520px] text-sm leading-8 text-gray-500 sm:text-base"
          >
            Discover amazing meals from your favourite restaurants
            and get them delivered straight to your doorstep.
          </motion.p>

          {/* LOCATION */}

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.6 }}
            className="mt-7 flex flex-wrap items-center gap-2 text-sm"
          >
            <MapPin size={19} className="text-[#EA580C]" />
            <span className="text-gray-500">Delivering to</span>

            <button
              type="button"
              className="inline-flex items-center gap-1 font-bold text-gray-900 transition-colors hover:text-[#EA580C]"
            >
              Your Location
              <ChevronRight size={16} />
            </button>
          </motion.div>

          {/* SEARCH FORM */}

          <motion.form
            initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.7 }}
            onSubmit={handleSearch}
            className="mt-5 flex h-[65px] w-full max-w-[570px] items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2 pl-5 shadow-[0_15px_45px_rgba(0,0,0,0.07)] focus-within:border-orange-300"
          >
            <Search size={21} className="shrink-0 text-gray-400" />

            <label htmlFor="hero-search" className="sr-only">
              Search for food
            </label>

            <input
              id="hero-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={placeholders[placeholderIndex]}
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />

            <motion.button
              type="submit"
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#EA580C] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200"
            >
              Search
              <ArrowRight size={16} />
            </motion.button>
          </motion.form>

          {/* STATISTICS */}

          <motion.dl
            initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.85,
              duration: 0.7,
            }}
            className="mt-11 flex flex-wrap gap-x-9 gap-y-5 sm:gap-x-12"
          >
            <div>
              <dt className="text-xs text-gray-500">Food options</dt>
              <dd className="mt-1 text-2xl font-black text-gray-900">
                <AnimatedNumber value={stats.foodOptions} suffix="+" />
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Restaurants</dt>
              <dd className="mt-1 text-2xl font-black text-gray-900">
                <AnimatedNumber value={stats.restaurants} suffix="+" />
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Average delivery</dt>
              <dd className="mt-1 text-2xl font-black text-gray-900">
                <AnimatedNumber
                  value={stats.avgDeliveryMinutes}
                  suffix=" min"
                />
              </dd>
            </div>
          </motion.dl>
        </motion.div>

        {/* RIGHT IMAGE SECTION */}

        <div className="relative mx-auto flex w-full max-w-[540px] items-center justify-center py-12 lg:py-0">

          {!shouldReduceMotion && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 45,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute aspect-square w-[95%] rounded-full border-2 border-dashed border-orange-300/70"
            />
          )}

          <motion.div
            ref={imageRef}
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scale: 0.75 }
            }
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.1,
              delay: shouldReduceMotion ? 0 : 0.3,
              ease: easeOutExpo,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
            style={{
              rotateX: shouldReduceMotion ? 0 : rotateX,
              rotateY: shouldReduceMotion ? 0 : rotateY,
              transformPerspective: 1000,
            }}
            className="relative z-10 aspect-square w-[80%] overflow-hidden rounded-full border-[12px] border-white bg-orange-100 shadow-[0_30px_80px_rgba(80,40,10,0.20)] sm:w-[75%]"
          >
            <img
              src="https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=1000&q=90"
              alt="Beautifully presented delicious food"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              fetchPriority="high"
            />
          </motion.div>

          {/* RATING CARD */}

          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-0 top-[12%] z-20 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:right-[-5px]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Star size={22} fill="currentColor" />
            </div>

            <div>
              <strong className="block text-base font-black">
                {stats.rating}/5
              </strong>
              <span className="text-[11px] text-gray-500">
                Customer rating
              </span>
            </div>
          </motion.div>

          {/* DELIVERY CARD */}

          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-[12%] left-0 z-20 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:left-[-10px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-[#EA580C]">
              <Clock3 size={23} />
            </div>

            <div>
              <strong className="block text-sm font-bold">
                Fast Delivery
              </strong>
              <span className="text-[11px] text-gray-500">
                At your doorstep
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}