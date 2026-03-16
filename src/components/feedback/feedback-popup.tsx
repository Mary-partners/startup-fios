"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Star,
  Send,
  X,
  ThumbsUp,
  CheckCircle2,
} from "lucide-react";

type FeedbackType = "review" | "rating" | "feedback";

const FEEDBACK_TYPES = [
  { value: "review" as FeedbackType, label: "Write a Review", icon: MessageSquare, description: "Tell us what you think" },
  { value: "rating" as FeedbackType, label: "Rate Us", icon: Star, description: "Quick 1-5 star rating" },
  { value: "feedback" as FeedbackType, label: "Give Feedback", icon: ThumbsUp, description: "Help us improve" },
];

const DELAY_MS = 3 * 60 * 1000; // Show after 3 minutes on the platform

export function FeedbackPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or submitted in this session
    const alreadyShown = sessionStorage.getItem("feedback-shown");
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("feedback-shown", "true");
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => setVisible(false), 300);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          rating: feedbackType === "rating" ? rating : null,
          message: message.trim() || null,
        }),
      });
    } catch {
      // Silent fail — feedback is non-critical
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-[360px] transition-all duration-300 ${
        dismissed ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-white/80" />
            <h3 className="text-sm font-bold text-white">
              {submitted ? "Thank You!" : "How are we doing?"}
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4 text-white/80" />
          </button>
        </div>

        <div className="p-5">
          {/* Success State */}
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Your feedback means the world to us!
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  We&apos;re building this for African startups — your input shapes our product.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="mt-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : !feedbackType ? (
            /* Type Selection */
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                You&apos;ve been exploring the platform — we&apos;d love to hear from you!
              </p>
              {FEEDBACK_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setFeedbackType(type.value)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{type.label}</p>
                      <p className="text-[11px] text-slate-500">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Feedback Form */
            <div className="space-y-4">
              {/* Rating Stars (for "rating" or "review" type) */}
              {(feedbackType === "rating" || feedbackType === "review") && (
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-2">
                    How would you rate CFOIP Financial OS?
                  </p>
                  <div className="flex gap-1.5 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="mt-1.5 text-center text-[11px] text-slate-500">
                      {rating === 5 ? "Amazing!" : rating === 4 ? "Great!" : rating === 3 ? "Good" : rating === 2 ? "Could be better" : "We'll improve!"}
                    </p>
                  )}
                </div>
              )}

              {/* Message textarea (for "review" or "feedback") */}
              {(feedbackType === "review" || feedbackType === "feedback") && (
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-1.5">
                    {feedbackType === "review"
                      ? "Share your experience"
                      : "What can we improve?"}
                  </p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === "review"
                        ? "I love the dashboard because..."
                        : "It would be great if..."
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setFeedbackType(null)}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    (feedbackType === "rating" && rating === 0) ||
                    (feedbackType === "review" && rating === 0 && !message.trim()) ||
                    (feedbackType === "feedback" && !message.trim())
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-3 w-3" />
                  {submitting ? "Sending..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
