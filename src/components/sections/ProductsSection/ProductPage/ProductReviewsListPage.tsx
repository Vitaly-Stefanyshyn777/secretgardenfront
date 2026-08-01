"use client";

import React from "react";
import { useProductReviewsQuery } from "@/components/hooks/useProductsQuery";
import ProductSubpageShell from "./ProductSubpageShell";
import styles from "./ProductSubpage.module.css";

const starPathFilled =
  "M16.5703 0.00162601C17.1956 0.00162601 17.6958 0.376814 17.946 0.877063L22.2606 9.69397L31.8279 11.1322C32.3907 11.1947 32.8284 11.6324 33.016 12.1327C33.2036 12.6955 33.0785 13.2583 32.6408 13.696L25.6998 20.5744L27.3257 30.2667C27.4507 30.8295 27.2006 31.4548 26.7629 31.7675C26.2626 32.0802 25.6373 32.1427 25.1371 31.8926L16.5703 27.2653L8.0035 31.8926C7.50325 32.1427 6.94047 32.0802 6.44022 31.7675C6.0025 31.4548 5.75238 30.8295 5.81491 30.2667L7.50325 20.5744L0.562282 13.696C0.124564 13.2583 -0.000498921 12.6955 0.187095 12.1327C0.374689 11.6324 0.812407 11.1947 1.37519 11.1322L10.9425 9.69397L15.2571 0.877063C15.5073 0.376814 16.0075 0.00162601 16.5703 0.00162601Z";

export default function ProductReviewsListPage({
  productSlug,
}: {
  productSlug: string;
}) {
  const { data, isLoading } = useProductReviewsQuery(productSlug);
  const backHref = `/products/${productSlug}`;

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

  return (
    <ProductSubpageShell title="Відгуки" backHref={backHref}>
      {isLoading ? (
        <p className={styles.loading}>Завантаження відгуків...</p>
      ) : reviewsList.length === 0 ? (
        <p className={styles.reviewsEmpty}>Поки немає відгуків.</p>
      ) : (
        <div className={styles.reviewsList}>
          {reviewsList.map((r) => (
            <article key={r.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewAuthor}>{r.authorName}</span>
                <div className={styles.reviewStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 34 33"
                      className={`${styles.starIcon} ${
                        i < r.rating ? "" : styles.starEmpty
                      }`}
                    >
                      <path d={starPathFilled} fill="currentColor" />
                    </svg>
                  ))}
                </div>
              </div>
              {r.title && <p className={styles.reviewText}>{r.title}</p>}
              <p className={styles.reviewText}>{r.text}</p>
            </article>
          ))}
        </div>
      )}
    </ProductSubpageShell>
  );
}
