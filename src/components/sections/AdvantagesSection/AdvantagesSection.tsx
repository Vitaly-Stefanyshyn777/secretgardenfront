"use client";

import Image from "next/image";
import {
  CardsIcons,
  LeafIcons,
  TruckIcons,
} from "@/components/Icons/Icons";
import s from "./AdvantagesSection.module.css";

type AdvantageItem = {
  id: string;
  title: string;
  description: string;
  icon?: () => JSX.Element;
  iconPath?: string;
};

const ADVANTAGES: AdvantageItem[] = [
  {
    id: "natural",
    title: "Натуральність",
    description:
      "Наша продукція це чиста органіка, з мінімальним хімічним втручанням",
    icon: LeafIcons,
  },
  {
    id: "delivery",
    title: "Доставка",
    description: "Ми відправляємо ваші замовлення як по Україні так і на таксі",
    icon: TruckIcons,
  },
  {
    id: "location",
    title: "Локація",
    description: "В центрі Дніпра, де ви можете насолодитися атмосферою",
    icon: CardsIcons,
  },
  {
    id: "communication",
    title: "Комунікабельність",
    description: "Наші дружні робітники завжди раді з вами поспілкуватися",
    iconPath: "/icons/Group-7.svg",
  },
];

const AdvantagesSection = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>Наші переваги</h2>
        <div className={s.cards}>
          {ADVANTAGES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className={s.card}>
                <div className={s.iconWrap}>
                  {item.iconPath ? (
                    <Image
                      src={item.iconPath}
                      alt=""
                      width={133}
                      height={133}
                      aria-hidden="true"
                    />
                  ) : (
                    Icon && <Icon />
                  )}
                </div>
                <div className={s.textBlock}>
                  <h3 className={s.cardTitle}>{item.title}</h3>
                  <p className={s.cardDescription}>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
