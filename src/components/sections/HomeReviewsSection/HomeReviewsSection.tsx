"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { SwiperRef } from "swiper/react";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import { useAllProductReviewsQuery } from "@/components/hooks/useAllProductReviewsQuery";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeDynamicText } from "@/lib/localizedContent";
import s from "./HomeReviewsSection.module.css";
import "swiper/css";

function splitAuthorName(name?: string | null) {
  const raw = (name || "").trim();
  if (!raw) return { firstName: "Гість", lastName: "" };
  const parts = raw.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function renderStars(rating: number) {
  const safe = Math.min(5, Math.max(0, Math.round(rating)));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

const HomeReviewsSection = () => {
  const { t, locale } = useTranslation();
  const { data: reviews = [], isLoading } = useAllProductReviewsQuery(50);
  const swiperRef = useRef<SwiperRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const ASSUMED_VISIBLE_DESKTOP = 5;
  const dotsCount = Math.max(
    1,
    Math.max(0, reviews.length - ASSUMED_VISIBLE_DESKTOP),
  );
  const activeDotIndex = reviews.length > 0 ? activeIndex % dotsCount : 0;

  const handlePrev = () => swiperRef.current?.swiper.slidePrev();
  const handleNext = () => swiperRef.current?.swiper.slideNext();
  const handleDotClick = (idx: number) =>
    swiperRef.current?.swiper.slideToLoop(idx);

  if (!isLoading && reviews.length === 0) {
    return null;
  }

  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.header}>
          <h2 className={s.sectionTitle}>{t("home.productReviewsTitle")}</h2>
          {reviews.length > ASSUMED_VISIBLE_DESKTOP && (
            <SliderNav
              activeIndex={activeDotIndex}
              dots={dotsCount}
              onPrev={handlePrev}
              onNext={handleNext}
              onDotClick={handleDotClick}
              containerClassName={s.reviewsNav}
            />
          )}
        </div>

        <div className={s.reviewsSliderWrap}>
          {isLoading ? (
            <p className={s.reviewsLoading}>{t("product.reviewsLoading")}</p>
          ) : (
            <Swiper
              ref={swiperRef}
              modules={[A11y]}
              slidesPerView="auto"
              slidesPerGroup={1}
              loop={reviews.length > 1}
              spaceBetween={30}
              onSlideChange={(swiper: SwiperType) =>
                setActiveIndex(swiper.realIndex)
              }
              className={s.reviewsSwiper}
              breakpoints={{
                0: { spaceBetween: 16 },
                768: { spaceBetween: 20 },
                1001: { spaceBetween: 30 },
              }}
            >
              {reviews.map((review) => {
                const { firstName, lastName } = splitAuthorName(
                  review.authorName,
                );
                const text =
                  review.text?.trim() ||
                  review.title?.trim() ||
                  t("home.reviewNoText");
                return (
                  <SwiperSlide key={review.id} className={s.reviewSlide}>
                    <article className={s.reviewCard}>
                      <div className={s.reviewHeader}>
                        <p className={s.reviewName}>
                          {firstName}
                          {lastName ? (
                            <>
                              <br />
                              {lastName}
                            </>
                          ) : null}
                        </p>
                        <p
                          className={s.reviewStars}
                          aria-label={t("home.reviewStarsLabel", {
                            rating: review.rating,
                          })}
                        >
                          {renderStars(review.rating)}
                        </p>
                      </div>
                      {review.productName ? (
                        <p className={s.reviewProduct}>{localizeDynamicText(review.productName, locale)}</p>
                      ) : null}
                      <p className={s.reviewText}>{text}</p>
                    </article>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeReviewsSection;
