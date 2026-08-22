"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  CardsIcons,
  LeafIcons,
  TruckIcons,
} from "@/components/Icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import s from "./AdvantagesSection.module.css";

type AdvantageItem = {
  id: string;
  title: string;
  description: string;
  icon?: () => React.ReactElement;
  iconPath?: string;
};

const AdvantagesSection = () => {
  const { t } = useTranslation();

  const advantages = useMemo<AdvantageItem[]>(
    () => [
      {
        id: "natural",
        title: t("home.advantageNaturalTitle"),
        description: t("home.advantageNaturalDesc"),
        icon: LeafIcons,
      },
      {
        id: "delivery",
        title: t("home.advantageDeliveryTitle"),
        description: t("home.advantageDeliveryDesc"),
        icon: TruckIcons,
      },
      {
        id: "location",
        title: t("home.advantageLocationTitle"),
        description: t("home.advantageLocationDesc"),
        icon: CardsIcons,
      },
      {
        id: "communication",
        title: t("home.advantageCommunicationTitle"),
        description: t("home.advantageCommunicationDesc"),
        iconPath: "/icons/Group-7.svg",
      },
    ],
    [t],
  );

  return (
    <section className={s.section}>
      <div className={s.container}>
        <h2 className={s.title}>{t("home.ourAdvantages")}</h2>
        <div className={s.cards}>
          {advantages.map((item) => {
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
