import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Leaf,
  Sparkles,
  Utensils,
} from "lucide-react";
import "./about.css";

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <span className="about-badge">
          <Sparkles size={15} />
          GET TO KNOW US
        </span>

        <h1>
          More than food.
          <br />
          <span>It&apos;s an experience.</span>
        </h1>

        <p>
          Welcome to Foodie, where discovering delicious food
          becomes a delightful experience. Find your favourites,
          explore new flavours and celebrate every bite.
        </p>

        <Link href="/products" className="about-primary-button">
          Explore Our Food <ArrowRight size={18} />
        </Link>

        <div className="about-hero-image">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1400"
            alt="A delicious selection of fresh food"
          />
        </div>
      </section>

      <section className="about-story">
        <div className="about-story-content">
          <span className="about-section-label">OUR STORY</span>

          <h2>
            Bringing people closer
            <span> through good food.</span>
          </h2>

          <p>
            Foodie was created with one simple idea: finding
            something delicious should always feel exciting.
          </p>

          <p>
            From everyday meals to special cravings, we make it
            easier to discover different dishes, explore flavours
            and enjoy your food journey.
          </p>
        </div>

        <div className="about-story-icon">
          <Utensils size={76} strokeWidth={1.3} />
          <span>Made with a love for food</span>
        </div>
      </section>

      <section className="about-values">
        <div className="about-section-heading">
          <span className="about-section-label">WHAT WE BELIEVE</span>
          <h2>Our little recipe for happiness.</h2>
          <p>Everything we do starts with a love for good food.</p>
        </div>

        <div className="about-values-grid">
          <div className="about-value-card">
            <div className="about-value-icon">
              <Heart size={26} />
            </div>
            <h3>Made with Passion</h3>
            <p>
              We believe food is more than a meal. Its something
              worth enjoying and sharing.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-value-icon">
              <Leaf size={26} />
            </div>
            <h3>Fresh Discoveries</h3>
            <p>
              Discover different dishes, exciting flavours and
              something new for every craving.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-value-icon">
              <Sparkles size={26} />
            </div>
            <h3>Simple Experiences</h3>
            <p>
              We make exploring food simple, enjoyable and
              convenient.
            </p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <span>YOUR NEXT FOOD FAVOURITE IS WAITING</span>
        <h2>Good food makes every moment better.</h2>
        <p>Let's discover something delicious together.</p>

        <Link href="/products" className="about-cta-button">
          Start Exploring <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}