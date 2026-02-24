"use client";

import s from "./HomeFaqSection.module.css";

type FaqItem = {
  title: string;
  paragraphs: string[];
  isSplit?: boolean;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    title: "Що таке CBD ?",
    paragraphs: [
      "CBD - це природна сполука, що міститься в рослині конопель. Він не має психоактивної дії та не викликає стану сп’яніння. CBD досліджують щодо можливого впливу на зниження стресу, покращення сну, загальне розслаблення.",
      "Ми пропонуємо лише легальну продукцію, яка відповідає чинному законодавству України.",
    ],
  },
  {
    title: "Чим CBD відрізняється від THC ?",
    paragraphs: [
      "CBD та THC - це різні компоненти рослини конопель, які по різному впливають на організм.",
      "THC має психоактивний ефект - тобто змінює стан свідомості та може викликати відчуття сп’яніння.",
      "CBD не має психоактивної дії та не викликає “ефекту ейфорії”. Його зазвичай обирають ті, хто шукає розслаблення без зміни свідомості.",
    ],
  },
  {
    title: "В чому користь мухоморів? ?",
    paragraphs: [
      "Мухомори традиційно використовувалися в різних культурах у вигляді висушеної сировини. Їм приписують вплив на релаксацію, покращення настрою, загальне самопочуття.",
      "⚠️ Водночас важливо розуміти, що реакція організму індивідуальна. Перед вживанням будь-яких продуктів рослинного походження рекомендується ознайомитись з інформацією та дотримуватись обережності.",
    ],
    isSplit: true,
  },
  {
    title: "Чи є у нас джойнти ?",
    paragraphs: [
      "Ні. Ми не продаємо джойнти або будь-яку продукцію сумнівного походження.",
      "Також ми не маємо відношення до інших магазинів чи сторонніх продавців.",
      "Ми працюємо виключно з перевіреною продукцією та дотримуємося чинного законодавства",
    ],
    isSplit: true,
  },
];

const HomeFaqSection = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.sectionTitle}>Питання та відповіді</h2>

        <div className={s.faqGrid}>
          {FAQ_ITEMS.map((item) => (
            <article key={item.title} className={s.faqCard}>
              <div className={s.faqCardInner}>
                <h3 className={s.faqTitle}>{item.title}</h3>
                <div
                  className={`${s.faqTextWrap} ${item.isSplit ? s.faqTextSplit : ""}`}
                >
                  {item.paragraphs.map((paragraph, index) => (
                    <p key={index} className={s.faqText}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFaqSection;
