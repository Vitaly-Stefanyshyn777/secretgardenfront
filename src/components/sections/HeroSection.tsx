"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Link from "next/link";
import s from "./HeroSection.module.css";
import { TimePayIcon } from "../Icons/Icons";
import { HERO_SLIDES, type HeroSlideItem } from "@/config/heroSlides";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";

const MOBILE_BREAKPOINT = 1000;

const getSlideImage = (slide: HeroSlideItem, isMobile: boolean) => {
  if (isMobile && slide.mobileImage) {
    return slide.mobileImage;
  }
  return slide.image;
};

const HeroSection = () => {
  const slides: HeroSlideItem[] = HERO_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isManualPagination, setIsManualPagination] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isManualChangeRef = React.useRef(false);
  const manualAnimationTimerRef = React.useRef<number | null>(null);

  const triggerManualPaginationAnimation = () => {
    setIsManualPagination(true);
    if (manualAnimationTimerRef.current) {
      window.clearTimeout(manualAnimationTimerRef.current);
    }
    manualAnimationTimerRef.current = window.setTimeout(() => {
      setIsManualPagination(false);
    }, 900);
  };

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      if (manualAnimationTimerRef.current) {
        window.clearTimeout(manualAnimationTimerRef.current);
      }
    };
  }, []);

  const activeSlide: HeroSlideItem | undefined = slides[activeIndex];
  const title = activeSlide?.title ?? "";
  const titleSub = activeSlide?.titleSub ?? "";
  const description = activeSlide?.description ?? "";

  return (
    <section className={s.hero} data-hero-section>
      {slides.length > 0 && (
        <Swiper
          modules={[A11y, Autoplay]}
          onSwiper={(inst: SwiperClass) => setSwiper(inst)}
          onSlideChange={(inst: SwiperClass) => {
            setActiveIndex(
              // realIndex коректно працює з loop
              (inst as any).realIndex ?? inst.activeIndex ?? 0,
            );
            if (isManualChangeRef.current) {
              triggerManualPaginationAnimation();
              isManualChangeRef.current = false;
            }
          }}
          onTouchStart={() => {
            isManualChangeRef.current = true;
          }}
          className={s.heroBanner}
          slidesPerView={1}
          spaceBetween={0}
          allowTouchMove={true}
          touchEventsTarget="container"
          loop
          autoplay={{ delay: 4000, disableOnInteraction: false }}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                className={s.heroBannerSlide}
                style={{
                  backgroundImage: `url("${getSlideImage(slide, isMobile)}")`,
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <div className={s.heroContainer}>
        <div className={s.heroContent}>
          <div className={s.heroContentBlock}>
            {titleSub ? (
              <div className={s.roiBanner}>
                <div className={s.roiIcon}>
                  <div className={s.roiIcon}>
                    <TimePayIcon />
                  </div>
                </div>
                <span className={s.roiText}>{titleSub.toUpperCase()}</span>
              </div>
            ) : null}

            <h1 className={s.heroTitle}>{title}</h1>
            <p className={s.heroDescription}>{description}</p>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          {/* Стрілки по центру по вертикалі, по краях по горизонталі */}
          <div className={s.heroArrows}>
            <button
              type="button"
              className={`${s.navArrow} ${s.navArrowLeft}`}
              aria-label="Попередній слайд"
              onClick={() => {
                isManualChangeRef.current = true;
                swiper?.slidePrev();
              }}
            >
              <img src="/icons/icon-4.svg" alt="" width={25} height={41} />
            </button>
            <button
              type="button"
              className={`${s.navArrow} ${s.navArrowRight}`}
              aria-label="Наступний слайд"
              onClick={() => {
                isManualChangeRef.current = true;
                swiper?.slideNext();
              }}
            >
              <img src="/icons/icon-3.svg" alt="" width={25} height={41} />
            </button>
          </div>

          {/* Крапки лишаються внизу, як і було */}
          <div className={s.heroNavigation}>
            <div className={s.navDots}>
              {slides.map((_, idx) => {
                if (idx === activeIndex) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`${s.paginationActive} ${
                        isManualPagination ? s.paginationActiveManual : ""
                      }`}
                      onClick={() => {
                        isManualChangeRef.current = true;
                        swiper?.slideToLoop(idx);
                      }}
                      aria-label={`Перейти до слайду ${idx + 1} (активний)`}
                    >
                      <span className={s.progressTrack} />
                      <span
                        key={`fill-${activeIndex}`}
                        className={s.progressFill}
                      />
                    </button>
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    className={s.paginationDot}
                    aria-label={`Перейти до слайду ${idx + 1}`}
                    onClick={() => {
                      isManualChangeRef.current = true;
                      swiper?.slideToLoop(idx);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className={s.heroOverlay} />
    </section>
  );
};

export default HeroSection;
