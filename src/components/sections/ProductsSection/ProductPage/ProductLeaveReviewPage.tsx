"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createProductReview } from "@/lib/bfbApi";
import ProductSubpageShell from "./ProductSubpageShell";
import styles from "./ProductSubpage.module.css";

const starPathFilled =
  "M16.5703 0.00162601C17.1956 0.00162601 17.6958 0.376814 17.946 0.877063L22.2606 9.69397L31.8279 11.1322C32.3907 11.1947 32.8284 11.6324 33.016 12.1327C33.2036 12.6955 33.0785 13.2583 32.6408 13.696L25.6998 20.5744L27.3257 30.2667C27.4507 30.8295 27.2006 31.4548 26.7629 31.7675C26.2626 32.0802 25.6373 32.1427 25.1371 31.8926L16.5703 27.2653L8.0035 31.8926C7.50325 32.1427 6.94047 32.0802 6.44022 31.7675C6.0025 31.4548 5.75238 30.8295 5.81491 30.2667L7.50325 20.5744L0.562282 13.696C0.124564 13.2583 -0.000498921 12.6955 0.187095 12.1327C0.374689 11.6324 0.812407 11.1947 1.37519 11.1322L10.9425 9.69397L15.2571 0.877063C15.5073 0.376814 16.0075 0.00162601 16.5703 0.00162601Z";
const starPathEmpty =
  "M16.5703 0.00162601C17.1956 0.00162601 17.6958 0.376814 17.946 0.877063L22.2606 9.69397L31.8279 11.1322C32.3907 11.1947 32.8284 11.6324 33.016 12.1327C33.2036 12.6955 33.0785 13.2583 32.6408 13.696L25.6998 20.5744L27.3257 30.2667C27.4507 30.8295 27.2006 31.4548 26.7629 31.7675C26.2626 32.0802 25.6373 32.1427 25.1371 31.8926L16.5703 27.2653L8.0035 31.8926C7.50325 32.1427 6.94047 32.0802 6.44022 31.7675C6.0025 31.4548 5.75238 30.8295 5.81491 30.2667L7.50325 20.5744L0.562282 13.696C0.124564 13.2583 -0.000498921 12.6955 0.187095 12.1327C0.374689 11.6324 0.812407 11.1947 1.37519 11.1322L10.9425 9.69397L15.2571 0.877063C15.5073 0.376814 16.0075 0.00162601 16.5703 0.00162601ZM16.5703 4.94159L13.3187 11.7575C13.0685 12.1952 12.6933 12.5079 12.1931 12.5704L4.75188 13.6334L10.1296 18.9486C10.5048 19.3238 10.6298 19.824 10.5673 20.3243L9.31666 27.7655L15.8824 24.2638C16.3202 24.0136 16.8829 24.0136 17.3207 24.2638L23.8864 27.7655L22.6358 20.3243C22.5108 19.824 22.6983 19.3238 23.0735 18.9486L28.3887 13.6334L21.01 12.5704C20.5098 12.5079 20.072 12.1952 19.8844 11.7575L16.5703 4.94159Z";

export default function ProductLeaveReviewPage({
  productSlug,
}: {
  productSlug: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const backHref = `/products/${productSlug}`;
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Оберіть оцінку");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await createProductReview(productSlug, {
        rating,
        text: text.trim() || undefined,
      });
      setSuccess(true);
      setText("");
      setRating(0);
      queryClient.invalidateQueries({
        queryKey: ["product", productSlug, "reviews"],
      });
      queryClient.invalidateQueries({ queryKey: ["product", productSlug] });
      setTimeout(() => {
        router.push(`/products/${productSlug}/reviews`);
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка відправки");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProductSubpageShell title="Залишити відгук" backHref={backHref}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {success && (
          <p className={styles.formSuccess}>
            Дякуємо! Ваш відгук опубліковано.
          </p>
        )}
        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.formField}>
          <p className={styles.formLabel}>Ваша оцінка</p>
          <div className={styles.formStars}>
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                className={styles.starButton}
                onClick={() => setRating(v)}
                aria-label={`${v} зірок`}
              >
                <svg viewBox="0 0 34 33">
                  {v <= rating ? (
                    <path d={starPathFilled} fill="currentColor" />
                  ) : (
                    <path
                      d={starPathEmpty}
                      fill="transparent"
                      fillRule="evenodd"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formField}>
          <p className={styles.formLabelSm}>Коментар</p>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder=""
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Відправка..." : "Надіслати"}
        </button>
      </form>
    </ProductSubpageShell>
  );
}
