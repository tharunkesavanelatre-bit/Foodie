"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, Trash2, Pencil } from "lucide-react";
import "../admin.css";

type Food = {
  id: string;
  name: string;
  category: string;
  price: number | string;
  image: string | null;
  isAvailable: boolean;
};

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadFoods() {
    try {
      const response = await fetch("/api/admin/foods", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load foods");
      }

      const data = await response.json();
      setFoods(data.foods);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods();
  }, []);

  async function deleteFood(id: string) {
    if (!confirm("Are you sure you want to delete this food?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/foods?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete food");
      }

      setFoods((previous) =>
        previous.filter((food) => food.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Unable to delete food.");
    }
  }

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <h2>
          FOODDIE<span>.</span>
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
        <div className="food-header">
          <div>
            <h1>Food Management</h1>
            <p>Manage your FOODDIE menu items.</p>
          </div>

          <Link href="/admin/foods/new" className="add-food-btn">
            <Plus size={18} />
            Add Food
          </Link>
        </div>

        <div className="food-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search food items..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading foods...</p>
        ) : (
          <div className="food-table-wrapper">
            <table className="food-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredFoods.map((food) => (
                  <tr key={food.id}>
                    <td>
                      <div className="food-name">
                        {food.image && (
                          <img src={food.image} alt={food.name} />
                        )}
                        {food.name}
                      </div>
                    </td>

                    <td>{food.category}</td>

                    <td>
                      ₹{Number(food.price).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {food.isAvailable ? "Available" : "Unavailable"}
                    </td>

                    <td>
                      <Link
                        href={`/admin/foods/${food.id}`}
                        className="food-action-btn"
                        title="Edit food"
                      >
                        <Pencil size={17} />
                      </Link>

                      <button
                        className="food-action-btn delete"
                        title="Delete food"
                        onClick={() => deleteFood(food.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredFoods.length === 0 && (
                  <tr>
                    <td colSpan={5}>No food items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}