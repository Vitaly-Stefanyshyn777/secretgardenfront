"use client";

import { useEffect, useState } from "react";
import {
  fetchFaqItems,
  type ContentFaqItem,
} from "@/lib/contentApi";
import s from "./HomeFaqSection.module.css";

function paragraphs(body: string) {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const HomeFaqSection = () => {
  const [items, setItems] = useState<ContentFaqItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchFaqItems()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.sectionTitle}>Питання та відповіді</h2>

        <div className={s.faqGrid}>
          {items.map((item) => {
            const texts = paragraphs(item.body);
            return (
              <article key={item.id} className={s.faqCard}>
                <div className={s.faqCardInner}>
                  <h3 className={s.faqTitle}>{item.title}</h3>
                  <div
                    className={`${s.faqTextWrap} ${
                      item.isSplit ? s.faqTextSplit : ""
                    }`}
                  >
                    {texts.map((paragraph, index) => (
                      <p key={index} className={s.faqText}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeFaqSection;
