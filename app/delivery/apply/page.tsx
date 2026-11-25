"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bike,
  Phone,
  Truck,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import "./apply.css";

export default function DeliveryApplyPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/delivery/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          vehicleType,
          vehicleNumber,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to submit your application.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="delivery-apply-page">
        <section className="delivery-apply-success">
          <div className="delivery-apply-success-icon">
            <CheckCircle2 size={42} />
          </div>

          <h1>Application Submitted!</h1>

          <p>
            Your delivery partner application has been submitted successfully.
            Our admin team will review your details.
          </p>

          <div className="delivery-apply-status">
            <span>Status</span>
            <strong>Pending Approval</strong>
          </div>

          <Link href="/" className="delivery-apply-home-button">
            Back to Foodie
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="delivery-apply-page">
      <section className="delivery-apply-container">
        <div className="delivery-apply-information">
          <Link href="/" className="delivery-apply-brand">
            Foodie<span>.</span>
          </Link>

          <div className="delivery-apply-illustration">
            <Bike size={76} strokeWidth={1.4} />
          </div>

          <span className="delivery-apply-tag">JOIN OUR DELIVERY TEAM</span>

          <h1>
            Deliver food.
            <br />
            <span>Earn on your terms.</span>
          </h1>

          <p>
            Become a Foodie delivery partner and enjoy flexible working
            opportunities while delivering happiness to customers.
          </p>

          <div className="delivery-apply-benefit">
            <CheckCircle2 size={19} />
            Flexible working opportunities
          </div>

          <div className="delivery-apply-benefit">
            <CheckCircle2 size={19} />
            Simple application process
          </div>

          <div className="delivery-apply-benefit">
            <CheckCircle2 size={19} />
            Dedicated delivery dashboard
          </div>
        </div>

        <div className="delivery-apply-form-section">
          <Link href="/" className="delivery-apply-back">
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <div className="delivery-apply-heading">
            <div className="delivery-apply-form-icon">
              <Truck size={25} />
            </div>

            <h2>Become a Delivery Partner</h2>

            <p>Enter your contact and vehicle information below.</p>
          </div>

          <form
            className="delivery-apply-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="phone">Mobile Number</label>

            <div className="delivery-apply-input">
              <Phone size={19} />

              <input
                id="phone"
                type="tel"
                placeholder="Enter your mobile number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={15}
                required
              />
            </div>

            <label htmlFor="vehicleType">Vehicle Type</label>

            <div className="delivery-apply-input">
              <Bike size={19} />

              <select
                id="vehicleType"
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                required
              >
                <option value="Bike">Motorcycle / Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Electric Bike">Electric Bike</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <label htmlFor="vehicleNumber">Vehicle Registration Number</label>

            <div className="delivery-apply-input">
              <FileText size={19} />

              <input
                id="vehicleNumber"
                type="text"
                placeholder="Example: TN01AB1234"
                value={vehicleNumber}
                onChange={(event) =>
                  setVehicleNumber(event.target.value.toUpperCase())
                }
                maxLength={30}
                required
              />
            </div>

            {error && (
              <div className="delivery-apply-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="delivery-apply-submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
              {!loading && <ArrowRight size={19} />}
            </button>

            <p className="delivery-apply-note">
              Your application will be reviewed by the Foodie admin team.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
