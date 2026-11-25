"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import "../../admin.css";

type Food = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image: string | null;
  price: number | string;
  isAvailable: boolean;
};

export default function EditFoodPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
    price: "",
    isAvailable: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFood() {
      try {
        const response = await fetch("/api/admin/foods", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load food");
        }

        const data = await response.json();

        const food: Food | undefined = data.foods.find(
          (item: Food) => item.id === id
        );

        if (!food) {
          throw new Error("Food item not found");
        }

        setForm({
          name: food.name,
          description: food.description || "",
          category: food.category,
          image: food.image || "",
          price: String(food.price),
          isAvailable: food.isAvailable,
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load food"
        );
      } finally {
        setLoading(false);
      }
    }

    loadFood();
  }, [id]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "isAvailable" ? value === "true" : value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/foods", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update food");
      }

      router.push("/admin/foods");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading food details...</p>;
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

        <h1>Edit Food</h1>
        <p>Update your food item information.</p>

        {error && <p className="form-error">{error}</p>}

        <form className="food-form" onSubmit={handleSubmit}>
          <label>Food Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />

          <label>Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <label>Image URL</label>
          <input
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
          />

          <label>Price (₹)</label>
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />

          <label>Availability</label>
          <select
            name="isAvailable"
            value={String(form.isAvailable)}
            onChange={handleChange}
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>

          <button type="submit" disabled={saving}>
            <Save size={18} />
            {saving ? "Saving..." : "Update Food"}
          </button>
        </form>
      </section>
    </main>
  );
}