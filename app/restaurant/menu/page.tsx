"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Utensils,
  RefreshCw,
} from "lucide-react";

import "./menu.css";

type Food = {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  isAvailable: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  category: "",
  image: "",
  price: "",
};

export default function RestaurantMenuPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  async function loadFoods() {
    try {
      setLoading(true);

      const response = await fetch("/api/restaurant/menu");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load menu.");
      }

      setFoods(data.foods || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
  }

  function openEditForm(food: Food) {
    setEditingId(food.id);

    setForm({
      name: food.name,
      description: food.description,
      category: food.category,
      image: food.image,
      price: String(food.price),
    });

    setShowForm(true);
    setMessage("");
  }

  async function saveFood(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        editingId
          ? `/api/restaurant/menu/${editingId}`
          : "/api/restaurant/menu",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save food.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await loadFoods();
      setMessage(data.message);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(food: Food) {
    try {
      const response = await fetch(`/api/restaurant/menu/${food.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAvailable: !food.isAvailable,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update availability.");
      }

      await loadFoods();
      setMessage(data.message);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  async function removeFood(food: Food) {
    if (!window.confirm(`Remove ${food.name} from your menu?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/restaurant/menu/${food.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove food.");
      }

      await loadFoods();
      setMessage(data.message);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  const filteredFoods = foods.filter((food) =>
    `${food.name} ${food.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="menu-page">
      <div className="menu-header">
        <div>
          <span className="menu-label">RESTAURANT MANAGEMENT</span>
          <h1>My Menu</h1>
          <p>Manage your dishes, prices and availability.</p>
        </div>

        <button className="menu-add-button" onClick={openAddForm}>
          <Plus size={18} />
          Add Food
        </button>
      </div>

      <div className="menu-stats">
        <div>
          <span>Total Items</span>
          <strong>{foods.length}</strong>
        </div>

        <div>
          <span>Available</span>
          <strong>
            {foods.filter((food) => food.isAvailable).length}
          </strong>
        </div>

        <div>
          <span>Unavailable</span>
          <strong>
            {foods.filter((food) => !food.isAvailable).length}
          </strong>
        </div>
      </div>

      {message && (
        <div className="menu-message">
          {message}
          <button onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="menu-toolbar">
        <div className="menu-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search food or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="menu-refresh" onClick={loadFoods}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {showForm && (
        <div className="menu-form-card">
          <div className="menu-form-heading">
            <h2>{editingId ? "Edit Food Item" : "Add New Food"}</h2>

            <button onClick={() => setShowForm(false)}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={saveFood}>
            <div className="menu-form-grid">
              <input
                placeholder="Food name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />

              <input
                placeholder="Category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Price (â‚¹)"
                min="1"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                required
              />

              <input
                placeholder="Food image URL"
                value={form.image}
                onChange={(e) =>
                  setForm({ ...form, image: e.target.value })
                }
                required
              />

              <textarea
                placeholder="Food description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="menu-save-button"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update Food" : "Add Food"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="menu-empty">
          <RefreshCw className="menu-loader" size={28} />
          <p>Loading menu...</p>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="menu-empty">
          <Utensils size={35} />
          <h3>No food items found</h3>
          <p>Add your first food item to get started.</p>
        </div>
      ) : (
        <div className="menu-food-grid">
          {filteredFoods.map((food) => (
            <div className="menu-food-card" key={food.id}>
              <div className="menu-food-image">
                <img src={food.image} alt={food.name} />

                <span
                  className={
                    food.isAvailable
                      ? "menu-status available"
                      : "menu-status unavailable"
                  }
                >
                  {food.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="menu-food-content">
                <span className="menu-food-category">
                  {food.category}
                </span>

                <h3>{food.name}</h3>
                <p>{food.description}</p>

                <div className="menu-food-bottom">
                  <strong>â‚¹{food.price.toFixed(2)}</strong>

                  <div className="menu-food-actions">
                    <button
                      title="Edit food"
                      onClick={() => openEditForm(food)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      title="Remove food"
                      onClick={() => removeFood(food)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <button
                  className="menu-availability-button"
                  onClick={() => toggleAvailability(food)}
                >
                  {food.isAvailable
                    ? "Mark Unavailable"
                    : "Mark Available"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
