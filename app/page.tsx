import HeroSection from "@/components/home/HeroSection";
import RestaurantList from "@/features/restaurants/components/RestaurantList";
import CategorySection from "@/components/home/CategorySection";
import PopularFoodsSection from "@/components/home/PopularFoodsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <RestaurantList />
      <CategorySection />
      <PopularFoodsSection />
    </>
  );
}