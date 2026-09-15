"use client";

import React, { useState, type FormEvent } from "react";
import { Star, X } from "lucide-react";
import axios from "axios";
import { submitReview } from "@/services/api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReviewErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setRating(5);
    setTitle("");
    setReviewText("");
    setError("");
  };

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const cleanTitle = title.trim();
    const cleanReviewText = reviewText.trim();

    if (!cleanTitle) {
      setError("Please enter a review title.");
      return;
    }

    if (!cleanReviewText) {
      setError("Please enter your review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await submitReview({
        reviewType: "GENERAL",
        rating,
        title: cleanTitle,
        reviewText: cleanReviewText,
      });

      resetForm();
      onSuccess();
      onClose();

    } catch (err: unknown) {
      console.error("Review submit error:", err);

      if (axios.isAxiosError(err)) {
        console.error(
          "Backend response:",
          err.response?.status,
          err.response?.data
        );

        const data = err.response?.data as ReviewErrorResponse | string;

        if (typeof data === "string") {
          setError(data);
        } else {
          setError(
            data?.message ||
            data?.error ||
            `Failed to submit review (${err.response?.status || "Network Error"})`
          );
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit review");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-surface rounded-2xl w-full max-w-lg border border-card-border overflow-hidden flex flex-col relative animate-fade-in shadow-2xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-card">
          <h3 className="text-xl font-bold text-foreground">
            Write a Review
          </h3>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close review modal"
            className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-foreground disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {error && (
            <div
              role="alert"
              className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm whitespace-pre-wrap"
            >
              {error}
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Rating
            </label>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  disabled={loading}
                  aria-label={`${star} star`}
                  className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
                >
                  <Star
                    size={28}
                    className={`${star <= rating
                      ? "text-primary fill-primary"
                      : "text-border"
                      } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="review-title"
              className="block text-sm font-medium text-muted mb-2"
            >
              Title
            </label>

            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="E.g. Excellent service!"
              maxLength={200}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder-muted/50 focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
              required
            />
          </div>

          {/* Review */}
          <div>
            <label
              htmlFor="review-text"
              className="block text-sm font-medium text-muted mb-2"
            >
              Review
            </label>

            <textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                setError("");
              }}
              placeholder="Tell us about your experience..."
              maxLength={5000}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder-muted/50 focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-y disabled:opacity-60"
              required
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-foreground bg-surface border border-border hover:bg-card transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-primary-contrast bg-primary hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-contrast/30 border-t-primary-contrast rounded-full animate-spin" />
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}