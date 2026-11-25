"use client";

import {
  CheckCircle2,
  CircleX,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

type ToastProps = {
  message: string;
  type: ToastType;
  onClose: () => void;
};

const toastConfig = {
  success: {
    icon: CheckCircle2,
    title: "Success!",
    color: "#16a34a",
    background: "#f0fdf4",
  },
  error: {
    icon: CircleX,
    title: "Something went wrong",
    color: "#dc2626",
    background: "#fef2f2",
  },
  info: {
    icon: Info,
    title: "Information",
    color: "#EA580C",
    background: "#fff7ed",
  },
  warning: {
    icon: AlertTriangle,
    title: "Attention",
    color: "#d97706",
    background: "#fffbeb",
  },
};

export default function Toast({
  message,
  type,
  onClose,
}: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <>
      <style>
        {`
          @keyframes foodieToastEnter {
            from {
              opacity: 0;
              transform: translateX(35px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }

          @keyframes foodieToastProgress {
            from { width: 100%; }
            to { width: 0%; }
          }

          .foodie-toast-enter {
            animation: foodieToastEnter 0.35s ease-out;
          }

          .foodie-toast-progress {
            animation: foodieToastProgress 4s linear forwards;
          }
        `}
      </style>

      <div
        role={type === "error" ? "alert" : "status"}
        className="foodie-toast-enter fixed right-4 top-5 z-[9999] w-[calc(100%-2rem)] max-w-[390px] overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-2xl sm:right-6 sm:top-6"
      >
        <div className="flex items-center gap-3 p-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: config.background }}
          >
            <Icon
              size={25}
              strokeWidth={2.3}
              style={{ color: config.color }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-stone-900">
              {config.title}
            </h3>

            <p className="mt-1 text-sm leading-5 text-stone-600">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close notification"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-1 w-full bg-stone-100">
          <div
            className="foodie-toast-progress h-full rounded-full"
            style={{
              backgroundColor: config.color,
            }}
          />
        </div>
      </div>
    </>
  );
}
