"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import { useProductReviewsQuery } from "@/components/hooks/useProductsQuery";
import { createProductReview } from "@/lib/bfbApi";
import { useQueryClient } from "@tanstack/react-query";
import { SendIcon } from "@/components/Icons/Icons";
import styles from "./ProductPage.module.css";
import "swiper/css";

interface ProductReviewsProps {
  productSlug: string;
  isMobile?: boolean;
}

const starPathFilled =
  "M16.5703 0.00162601C17.1956 0.00162601 17.6958 0.376814 17.946 0.877063L22.2606 9.69397L31.8279 11.1322C32.3907 11.1947 32.8284 11.6324 33.016 12.1327C33.2036 12.6955 33.0785 13.2583 32.6408 13.696L25.6998 20.5744L27.3257 30.2667C27.4507 30.8295 27.2006 31.4548 26.7629 31.7675C26.2626 32.0802 25.6373 32.1427 25.1371 31.8926L16.5703 27.2653L8.0035 31.8926C7.50325 32.1427 6.94047 32.0802 6.44022 31.7675C6.0025 31.4548 5.75238 30.8295 5.81491 30.2667L7.50325 20.5744L0.562282 13.696C0.124564 13.2583 -0.000498921 12.6955 0.187095 12.1327C0.374689 11.6324 0.812407 11.1947 1.37519 11.1322L10.9425 9.69397L15.2571 0.877063C15.5073 0.376814 16.0075 0.00162601 16.5703 0.00162601Z";
const starPathEmpty =
  "M16.5703 0.00162601C17.1956 0.00162601 17.6958 0.376814 17.946 0.877063L22.2606 9.69397L31.8279 11.1322C32.3907 11.1947 32.8284 11.6324 33.016 12.1327C33.2036 12.6955 33.0785 13.2583 32.6408 13.696L25.6998 20.5744L27.3257 30.2667C27.4507 30.8295 27.2006 31.4548 26.7629 31.7675C26.2626 32.0802 25.6373 32.1427 25.1371 31.8926L16.5703 27.2653L8.0035 31.8926C7.50325 32.1427 6.94047 32.0802 6.44022 31.7675C6.0025 31.4548 5.75238 30.8295 5.81491 30.2667L7.50325 20.5744L0.562282 13.696C0.124564 13.2583 -0.000498921 12.6955 0.187095 12.1327C0.374689 11.6324 0.812407 11.1947 1.37519 11.1322L10.9425 9.69397L15.2571 0.877063C15.5073 0.376814 16.0075 0.00162601 16.5703 0.00162601ZM16.5703 4.94159L13.3187 11.7575C13.0685 12.1952 12.6933 12.5079 12.1931 12.5704L4.75188 13.6334L10.1296 18.9486C10.5048 19.3238 10.6298 19.824 10.5673 20.3243L9.31666 27.7655L15.8824 24.2638C16.3202 24.0136 16.8829 24.0136 17.3207 24.2638L23.8864 27.7655L22.6358 20.3243C22.5108 19.824 22.6983 19.3238 23.0735 18.9486L28.3887 13.6334L21.01 12.5704C20.5098 12.5079 20.072 12.1952 19.8844 11.7575L16.5703 4.94159Z";

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 34 33"
    className={
      [styles.starIcon, filled ? styles.starFilled : styles.starEmpty]
        .filter((c): c is string => typeof c === "string" && c.length > 0)
        .join(" ") || undefined
    }
  >
    {filled ? (
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
);

const ReviewCard = ({
  authorName,
  rating,
  title,
  text,
}: {
  authorName: string;
  rating: number;
  title?: string;
  text: string;
}) => (
  <div className={styles.reviewCard}>
    <div className={styles.reviewHeader}>
      <span className={styles.reviewAuthor}>{authorName}</span>
      <div className={styles.reviewStars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < rating} />
        ))}
      </div>
    </div>
    {title && <p className={styles.reviewTitle}>{title}</p>}
    <p className={styles.reviewText}>{text}</p>
  </div>
);

export default function ProductReviews({
  productSlug,
  isMobile = false,
}: ProductReviewsProps) {
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
    rating: 0,
    text: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating < 1) {
      setError("Оберіть оцінку");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await createProductReview(productSlug, {
        rating: form.rating,
        text: form.text.trim() || undefined,
      });
      setSuccess(true);
      setForm({ rating: 0, text: "" });
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

  const leaveReviewForm = (
    <form
      className={`${styles.leaveReviewForm} ${
        isMobile ? styles.leaveReviewFormMobile : ""
      }`}
      onSubmit={handleSubmit}
    >
      {success && (
        <p className={styles.reviewSuccess}>
          Дякуємо! Ваш відгук опубліковано.
        </p>
      )}
      {error && <p className={styles.reviewError}>{error}</p>}
      <div className={styles.formField}>
        <label className={styles.formLabel}>Ваша оцінка</label>
        <div className={styles.reviewFormStars}>
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
        <label className={styles.formLabel}>Коментар</label>
        <textarea
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          rows={5}
          placeholder="Напишіть ваш відгук..."
          className={styles.reviewTextarea}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitReviewBtn}
      >
        {isSubmitting ? "Відправка..." : "Надіслати"}
        {!isMobile && (
          <span className={styles.submitReviewBtnIcon}>
            <SendIcon />
          </span>
        )}
      </button>
    </form>
  );

  if (isMobile) {
    return (
      <div className={`${styles.productReviews} ${styles.productReviewsMobile}`}>
        {activeTab === "reviews" ? (
          <>
            <h2 className={styles.reviewsSectionTitle}>Відгуки</h2>
            <div className={styles.reviewsSliderWrap}>
              {isLoading ? (
                <p className={styles.reviewsLoading}>Завантаження відгуків...</p>
              ) : reviewsList.length === 0 ? (
                <p className={styles.reviewsEmptyMobile}>
                  Поки немає відгуків. Залиште перший!
                </p>
              ) : (
                <Swiper
                  modules={[A11y]}
                  slidesPerView="auto"
                  slidesPerGroup={1}
                  spaceBetween={16}
                  className={styles.reviewsSwiper}
                >
                  {reviewsList.map((r) => (
                    <SwiperSlide key={r.id} className={styles.reviewSlide}>
                      <ReviewCard
                        authorName={r.authorName}
                        rating={r.rating}
                        title={r.title}
                        text={r.text}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
            <button
              type="button"
              className={styles.leaveReviewBtn}
              onClick={() => setActiveTab("leave")}
            >
              Залишити відгук
            </button>
          </>
        ) : (
          <>
            <div className={styles.leaveReviewHeader}>
              <button
                type="button"
                className={styles.leaveReviewBackArrow}
                onClick={() => setActiveTab("reviews")}
                aria-label="Назад до відгуків"
              >
                ←
              </button>
              <h2 className={styles.leaveReviewHeaderTitle}>Залишити відгук</h2>
              <span className={styles.leaveReviewHeaderSpacer} aria-hidden="true" />
            </div>
            {leaveReviewForm}
          </>
        )}
      </div>
    );
  }

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
              <ReviewCard
                key={r.id}
                authorName={r.authorName}
                rating={r.rating}
                title={r.title}
                text={r.text}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "leave" && leaveReviewForm}
    </div>
  );
}
