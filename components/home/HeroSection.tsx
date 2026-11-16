import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

import SearchBar from "@/components/ui/SearchBar";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-app-container">

        {/* Left Content */}
        <div className="hero-content">
          <span className="hero-badge">
            <Sparkles size={16} />
            YOUR DAILY FOOD DESTINATION
          </span>

          <h1>
            Discover Food.
            <br />
            <span>Love Every Bite.</span>
          </h1>

          <p>
            Explore delicious meals, discover exciting flavours
            and find something amazing to enjoy today.
          </p>

          <SearchBar />

          <Link href="/products" className="hero-button">
            Explore Food <ArrowRight size={18} />
          </Link>

          <div className="hero-info">
            <span>Fresh Choices</span>
            <span>Delicious Discoveries</span>
            <span>Made for Food Lovers</span>
          </div>
        </div>

        {/* Right Food Showcase */}
        <div className="hero-visual">

          <div className="hero-image-main">
            <Image
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900"
              alt="Fresh and delicious food bowl"
              width={900}
              height={700}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="hero-food-card hero-food-one">
            <Image
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=300"
              alt="Delicious burger"
              width={300}
              height={200}
              sizes="(max-width: 768px) 40vw, 200px"
            />
            <div>
              <strong>Juicy Burger</strong>
              <span>Must Try</span>
            </div>
          </div>

          <div className="hero-food-card hero-food-two">
            <Image
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300"
              alt="Italian pizza"
              width={300}
              height={200}
              sizes="(max-width: 768px) 40vw, 200px"
            />
            <div>
              <strong>Italian Pizza</strong>
              <span>Popular Choice</span>
            </div>
          </div>

          <div className="hero-floating-label">
            <Sparkles size={17} />
            Good Food, Great Mood!
          </div>

        </div>
      </div>
    </section>
  );
}