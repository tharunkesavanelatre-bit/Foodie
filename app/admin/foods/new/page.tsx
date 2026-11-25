"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import "../../admin.css";

export default function AddFoodPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
    price: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/foods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add food");
      }

      router.push("/admin/foods");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <h2>
          Foodie<span>.</span>
        </h2>

        <p className="sidebar-label">ADMIN PANEL</p>

        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/foods" className="active">
            Food Management
          </Link>
          <Link href="/admin/categories">Categories</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/users">Users</Link>
        </nav>
      </aside>

      <section className="admin-dashboard">
        <Link href="/admin/foods" className="back-link">
          <ArrowLeft size={18} />
          Back to Foods
        </Link>

        <h1>Add New Food</h1>
        <p>Add a new item to your Foodie menu.</p>

        <form className="food-form" onSubmit={handleSubmit}>
          <label>Food Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter food name"
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter food description"
            rows={4}
          />

          <label>Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Example: Chicken"
            required
          />

          <label>Image URL</label>
          <input
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            placeholder="Enter food image URL"
          />

          <label>Price (â‚¹)</label>
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price"
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            <Plus size={18} />
            {loading ? "Adding..." : "Add Food"}
          </button>
        </form>
      </section>
    </main>
  );
}
