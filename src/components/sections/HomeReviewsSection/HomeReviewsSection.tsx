"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { SwiperRef } from "swiper/react";
import SliderNav from "@/components/ui/SliderNav/SliderNavActions";
import s from "./HomeReviewsSection.module.css";
import "swiper/css";

const REVIEWS = Array.from({ length: 12 }).map((_, idx) => ({
  id: idx + 1,
  firstName: "Гончаренко",
  lastName: "Катерина",
  text: "Lorem ipsum dolor sit amet consectetur. Sapien gravida posuere rhoncus duis amet sed in massa. Tempus at tellus fusce facilisis tellus et ac. Dolor eget proin aenean vitae. Proin senectus neque pellentesque ipsum venenatis.",
}));

const HomeReviewsSection = () => {
  const swiperRef = useRef<SwiperRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  /** Лише для кількості крапок (при `slidesPerView: auto` видима кількість залежить від vw у CSS) */
  const ASSUMED_VISIBLE_DESKTOP = 5;
  const dotsCount = Math.max(1, REVIEWS.length - ASSUMED_VISIBLE_DESKTOP);
  const activeDotIndex = activeIndex % dotsCount;

  const handlePrev = () => swiperRef.current?.swiper.slidePrev();
  const handleNext = () => swiperRef.current?.swiper.slideNext();
  const handleDotClick = (idx: number) =>
    swiperRef.current?.swiper.slideToLoop(idx);

  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.header}>
          <h2 className={s.sectionTitle}>Відгуки про нас</h2>
          <SliderNav
            activeIndex={activeDotIndex}
            dots={dotsCount}
            onPrev={handlePrev}
            onNext={handleNext}
            onDotClick={handleDotClick}
            containerClassName={s.reviewsNav}
          />
        </div>

        <div className={s.reviewsSliderWrap}>
          <Swiper
            ref={swiperRef}
            modules={[A11y]}
            slidesPerView="auto"
            slidesPerGroup={1}
            loop={true}
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
            {REVIEWS.map((review) => (
              <SwiperSlide key={review.id} className={s.reviewSlide}>
                <article className={s.reviewCard}>
                  <div className={s.reviewHeader}>
                    <p className={s.reviewName}>
                      {review.firstName}
                      <br />
                      {review.lastName}
                    </p>
                    <p className={s.reviewStars} aria-label="5 зірок">
                      ★★★★★
                    </p>
                  </div>
                  <p className={s.reviewText}>{review.text}</p>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HomeReviewsSection;
