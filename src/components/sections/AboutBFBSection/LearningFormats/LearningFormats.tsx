"use client";

import React from "react";
import s from "./LearningFormats.module.css";

export default function LearningFormats() {
  return (
    <section className={s.learningFormats}>
      <div className={s.container}>
        <span className={s.subtitle}>Формати навчання</span>
        <h2 className={s.title}>Як можна займатися</h2>
        <div className={s.formatsGrid}>
          <div className={s.formatCard}>
            <h3 className={s.formatTitle}>Онлайн</h3>
            <p className={s.formatDescription}>
              Зручні заняття з будь-якої точки світу
            </p>
          </div>
          <div className={s.formatCard}>
            <h3 className={s.formatTitle}>Офлайн</h3>
            <p className={s.formatDescription}>
              Заняття в студії з тренером
            </p>
          </div>
          <div className={s.formatCard}>
            <h3 className={s.formatTitle}>Індивідуально</h3>
            <p className={s.formatDescription}>
              Персональний підхід до кожного
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
