"use client";
import React from "react";
import Link from "next/link";
import s from "./HeroSectionTwo.module.css";
import { TimePayIcon } from "../Icons/Icons";
import { HERO_SLIDES } from "@/config/heroSlides";

const HeroSectionTwo = () => {
  const [block1, block2, block3] = HERO_SLIDES;

  return (
    <section className={s.heroTwo} data-hero-section>
      {/* Блок 1 */}
      <div
        className={s.heroTwoBlock}
          style={{ backgroundImage: `url(${block1.image})` }}
      >
        <div className={s.heroTwoBlockContent}>
          <div className={s.heroTwoContent}>
            <div className={s.heroTwoContentBlock}>
              {block1.titleSub ? (
                <div className={s.roiBanner}>
                  <TimePayIcon />
                  <span className={s.roiText}>{block1.titleSub.toUpperCase()}</span>
                </div>
              ) : null}
              <h1 className={s.heroTwoTitle}>{block1.title}</h1>
              <p className={s.heroTwoDescription}>{block1.description}</p>
            </div>
            <div className={s.heroTwoActions}>
              <Link href="/courses-landing" className={s.heroTwoButtonPrimary}>
                Про курс
              </Link>
              <Link href="/trainers" className={s.heroTwoButtonSecondary}>
                Знайти інструктора
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Блок 2 */}
      <div
        className={s.heroTwoBlock}
        style={{ backgroundImage: `url(${block2.image})` }}
      >
        <div className={s.heroTwoBlockContent}>
          <div className={s.heroTwoContent}>
            <div className={s.heroTwoContentBlock}>
              {block2.titleSub ? (
                <div className={s.roiBanner}>
                  <TimePayIcon />
                  <span className={s.roiText}>{block2.titleSub.toUpperCase()}</span>
                </div>
              ) : null}
              <h2 className={s.heroTwoTitle}>{block2.title}</h2>
              <p className={s.heroTwoDescription}>{block2.description}</p>
            </div>
            <div className={s.heroTwoActions}>
              <Link href="/courses-landing" className={s.heroTwoButtonPrimary}>
                Про курс
              </Link>
              <Link href="/trainers" className={s.heroTwoButtonSecondary}>
                Знайти інструктора
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Блок 3 */}
      <div
        className={s.heroTwoBlock}
        style={{ backgroundImage: `url(${block3.image})` }}
      >
        <div className={s.heroTwoBlockContent}>
          <div className={s.heroTwoContent}>
            <div className={s.heroTwoContentBlock}>
              {block3.titleSub ? (
                <div className={s.roiBanner}>
                  <TimePayIcon />
                  <span className={s.roiText}>{block3.titleSub.toUpperCase()}</span>
                </div>
              ) : null}
              <h2 className={s.heroTwoTitle}>{block3.title}</h2>
              <p className={s.heroTwoDescription}>{block3.description}</p>
            </div>
            <div className={s.heroTwoActions}>
              <Link href="/courses-landing" className={s.heroTwoButtonPrimary}>
                Про курс
              </Link>
              <Link href="/trainers" className={s.heroTwoButtonSecondary}>
                Знайти інструктора
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionTwo;
