"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Utensils,
  Home,
  LayoutGrid,
  Search,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Info,
  MapPin,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";

type UserSession = {
  name: string;
  email: string;
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart } = useCart();

  const [session, setSession] = useState<UserSession | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function updateSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        if (!response.ok) {
          setSession(null);
          return;
        }

        const data = await response.json();
        setSession(data.user);
      } catch {
        setSession(null);
      } finally {
        setAuthLoaded(true);
      }
    }

    updateSession();

    window.addEventListener("fooddie-auth-change", updateSession);

    return () => {
      window.removeEventListener("fooddie-auth-change", updateSession);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.dispatchEvent(new Event("fooddie-cart-change"));
  }, [pathname]);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        alert("Unable to log out. Please try again.");
        return;
      }

      setSession(null);
      setMenuOpen(false);

      window.dispatchEvent(new Event("fooddie-auth-change"));

      router.push("/");
      router.refresh();
    } catch {
      alert("Something went wrong. Please try again.");
    }
  }

  const navigationLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/categories", icon: LayoutGrid },
    { label: "Explore Food", href: "/products", icon: Search },
    { label: "Nearby Restaurants", href: "/restaurants", icon: MapPin },
    { label: "About Us", href: "/about", icon: Info },
  ];

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const authTransition = `transition-all duration-500 ease-out ${
    authLoaded
      ? "translate-y-0 opacity-100"
      : "pointer-events-none translate-y-2 opacity-0"
  }`;

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100/70 bg-white/90 shadow-[0_4px_25px_rgba(120,53,15,0.05)] backdrop-blur-xl">

      <div className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-4 px-5 py-4 xl:px-8 2xl:px-10">

        {/* Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-200 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
            <Utensils size={23} />
          </span>

          <span className="whitespace-nowrap text-2xl font-extrabold tracking-tight text-stone-900">
            fooddie<span className="text-orange-600">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
          {navigationLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative whitespace-nowrap rounded-full px-3 py-3 text-sm font-semibold transition-all duration-300 2xl:px-4 ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-stone-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {link.label}

                <span
                  className={`absolute bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-orange-500 transition-all duration-300 ${
                    isActive ? "w-5" : "w-0 group-hover:w-5"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 items-center gap-3 xl:flex">

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="My Wishlist"
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-3 text-sm font-bold transition ${
              pathname.startsWith("/wishlist")
                ? "bg-orange-50 text-orange-600"
                : "text-stone-600 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            <Heart size={20} />
            Wishlist
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="group relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-3 text-sm font-bold !text-white shadow-lg shadow-orange-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-200"
          >
            <ShoppingBag size={18} />
            My Cart

            <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-orange-600">
              {cartCount}
            </span>
          </Link>

          {/* User Profile */}
          <div
            className={`flex min-w-[170px] items-center justify-end ${authTransition}`}
          >
            {session ? (
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <User size={20} />
                </div>

                <div className="max-w-28">
                  <p className="whitespace-nowrap text-xs text-stone-400">
                    Welcome back
                  </p>

                  <p className="truncate text-sm font-bold text-stone-800">
                    {session.name}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="shrink-0 rounded-full p-2.5 text-stone-500 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={19} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="whitespace-nowrap text-sm font-bold text-stone-700 transition hover:text-orange-600"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="whitespace-nowrap rounded-full border border-orange-500 px-4 py-3 text-sm font-bold text-orange-600 transition duration-300 hover:bg-orange-600 hover:text-white"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-stone-800 transition hover:bg-orange-100 xl:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t border-orange-100 bg-white px-5 py-6 shadow-xl xl:hidden">

          <nav className="space-y-2">
            {navigationLinks.map((link) => {
              const Icon = link.icon;

              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3.5 font-semibold transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-stone-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className={`flex items-center gap-4 rounded-xl px-4 py-3.5 font-semibold transition ${
                pathname.startsWith("/wishlist")
                  ? "bg-orange-50 text-orange-600"
                  : "text-stone-700 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <Heart size={20} />
              My Wishlist
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center justify-between rounded-xl px-4 py-3.5 font-semibold text-stone-700 transition hover:bg-orange-50 hover:text-orange-600"
            >
              <span className="flex items-center gap-4">
                <ShoppingBag size={20} />
                My Cart
              </span>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                {cartCount}
              </span>
            </Link>
          </nav>

          <div className="my-5 border-t border-orange-100" />

          {/* Mobile Account */}
          <div className={authTransition}>
            {session ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-3">
                  <User className="text-orange-600" size={21} />
                  <span className="font-semibold text-stone-800">
                    {session.name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl bg-red-50 px-4 py-3.5 font-semibold text-red-500 transition hover:bg-red-100"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="rounded-xl border border-orange-200 py-3 text-center text-sm font-bold text-orange-600 transition hover:bg-orange-50"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-orange-600 py-3 text-center text-sm font-bold text-white transition hover:bg-orange-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}