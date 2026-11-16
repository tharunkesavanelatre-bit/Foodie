import Link from "next/link";
import {
  Camera,
  Globe,
  Play,
  ArrowUp,
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "Explore Food", href: "/products" },
  { name: "About Us", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="foodie-footer">
      <div className="footer-container">

        {/* Promotional Banner */}
        <div className="footer-app-banner">
          <div className="footer-banner-content">
            <span>GOOD FOOD. GOOD MOOD.</span>

            <h2>
              Your cravings.
              <br />
              Your FOODDIE moment.
            </h2>

            <Link href="/products" className="footer-explore-button">
              Explore Food <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="footer-banner-image">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700"
              alt="Fresh delicious food bowl"
            />
          </div>
        </div>

        {/* Main Footer */}
        <div className="footer-main">

          {/* Brand */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              FOODDIE<span>.</span>
            </Link>

            <p>
              Discover delicious meals, explore exciting flavours
              and enjoy every bite with FOODDIE.
            </p>

            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Camera size={19} />
              </a>

              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Globe size={19} />
              </a>

              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Play size={19} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="footer-column">
            <h3>Explore FOODDIE</h3>

            <div className="footer-links">
              {exploreLinks.map((link) => (
                <Link href={link.href} key={link.name}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="footer-contact-card">
            <div className="footer-contact-icon">
              <ShoppingBag size={23} />
            </div>

            <span>READY TO EAT?</span>

            <h3>
              Find your
              <br />
              next favourite meal.
            </h3>

            <Link href="/products" className="footer-cta-button">
              Start Exploring <ArrowUpRight size={17} />
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2026 FOODDIE. All rights reserved.</p>

          <p>Made for food lovers.</p>

          <a href="#top">
            Back to Top <ArrowUp size={16} />
          </a>
        </div>

      </div>
    </footer>
  );
}