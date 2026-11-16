import { Leaf, Bike, Heart } from "lucide-react";

import FoodCard from "@/features/products/components/FoodCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { foods } from "@/data/foods";

const benefits = [
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description: "Quality ingredients in every meal.",
  },
  {
    icon: Bike,
    title: "Fast Delivery",
    description: "Delicious food delivered to your door.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every dish prepared with care.",
  },
];

export default function PopularFoodsSection() {
  return (
    <section className="popular-section">
      <div className="popular-container">
        <SectionHeading
          badge="CUSTOMER FAVOURITES"
          title="Popular"
          highlight="Foods"
          description="Discover the delicious dishes everyone loves."
          headingClassName="popular-heading"
          badgeClassName="popular-badge"
        />

        <div className="popular-food-grid">
          {foods.map((food) => (
            <FoodCard key={food.name} {...food} />
          ))}
        </div>

        <div className="popular-benefits">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div key={benefit.title} className="popular-benefit-card">
                <Icon size={24} />
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}