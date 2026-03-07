"use client";
import React, { useState } from "react";
import { useProductReviewsQuery } from "@/components/hooks/useProductsQuery";
import { createProductReview } from "@/lib/bfbApi";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./ProductPage.module.css";

interface ProductReviewsProps {
  productSlug: string;
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    className={
      [styles.starIcon, filled ? styles.starFilled : styles.starEmpty]
        .filter((c): c is string => typeof c === "string" && c.length > 0)
        .join(" ") || undefined
    }
  >
    <path
      d="M10 1.66699L12.4722 6.67699L18 7.50033L14 11.3337L14.9444 16.8337L10 14.3337L5.05556 16.8337L6 11.3337L2 7.50033L7.52778 6.67699L10 1.66699Z"
      fill="currentColor"
    />
  </svg>
);

export default function ProductReviews({ productSlug }: ProductReviewsProps) {
  const { data, isLoading } = useProductReviewsQuery(productSlug);
  const reviewsList = (() => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (Array.isArray(d.items)) return d.items;
      if (Array.isArray(d.reviews)) return d.reviews;
      if (Array.isArray(d.data)) return d.data;
    }
    return [];
  })() as Array<{
    id: string;
    authorName: string;
    rating: number;
    title?: string;
    text: string;
  }>;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"reviews" | "leave">("reviews");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    authorName: "",
    rating: 0,
    title: "",
    text: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim() || !form.authorName.trim() || form.rating < 1) {
      setError("Заповніть всі обов'язкові поля та оберіть оцінку");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await createProductReview(productSlug, {
        authorName: form.authorName.trim(),
        rating: form.rating,
        title: form.title.trim() || undefined,
        text: form.text.trim(),
      });
      setSuccess(true);
      setForm({ authorName: "", rating: 0, title: "", text: "" });
      queryClient.invalidateQueries({
        queryKey: ["product", productSlug, "reviews"],
      });
      queryClient.invalidateQueries({ queryKey: ["product", productSlug] });
      setActiveTab("reviews");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка відправки");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.productReviews}>
      <div className={styles.reviewsTabs}>
        <button
          type="button"
          className={`${styles.reviewsTab} ${activeTab === "reviews" ? styles.reviewsTabActive : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Відгуки
        </button>
        <button
          type="button"
          className={`${styles.reviewsTab} ${activeTab === "leave" ? styles.reviewsTabActive : ""}`}
          onClick={() => setActiveTab("leave")}
        >
          Залишити відгук
        </button>
      </div>

      {activeTab === "reviews" && (
        <div className={styles.reviewsList}>
          {isLoading ? (
            <p className={styles.reviewsLoading}>Завантаження відгуків...</p>
          ) : reviewsList.length === 0 ? (
            <p className={styles.reviewsEmpty}>
              Поки немає відгуків. Залиште перший!
            </p>
          ) : (
            reviewsList.map((r) => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewAuthor}>{r.authorName}</span>
                  <div className={styles.reviewStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < r.rating} />
                    ))}
                  </div>
                </div>
                {r.title && <p className={styles.reviewTitle}>{r.title}</p>}
                <p className={styles.reviewText}>{r.text}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "leave" && (
        <form className={styles.leaveReviewForm} onSubmit={handleSubmit}>
          {success && (
            <p className={styles.reviewSuccess}>
              Дякуємо! Ваш відгук опубліковано.
            </p>
          )}
          {error && <p className={styles.reviewError}>{error}</p>}
          <div className={styles.formField}>
            <label>Ім&apos;я та прізвище *</label>
            <input
              type="text"
              value={form.authorName}
              onChange={(e) =>
                setForm((f) => ({ ...f, authorName: e.target.value }))
              }
              required
              placeholder="Гончаренко Катерина"
            />
          </div>
          <div className={styles.formField}>
            <label>Оцінка *</label>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={styles.starButton}
                  onClick={() => setForm((f) => ({ ...f, rating: v }))}
                >
                  <StarIcon filled={v <= form.rating} />
                </button>
              ))}
            </div>
          </div>
          <div className={styles.formField}>
            <label>Заголовок (необов&apos;язково)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Короткий заголовок"
            />
          </div>
          <div className={styles.formField}>
            <label>Текст відгуку *</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              required
              rows={4}
              placeholder="Опишіть ваш досвід..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitReviewBtn}
          >
            {isSubmitting ? "Відправка..." : "Залишити відгук"}
          </button>
        </form>
      )}
    </div>
  );
}
