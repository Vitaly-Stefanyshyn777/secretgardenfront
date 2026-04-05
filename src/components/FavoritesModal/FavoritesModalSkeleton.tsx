"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./FavoritesModal.module.css";
import "react-loading-skeleton/dist/skeleton.css";
import { CardSkeleton } from "@/components/ui/CardSkeleton/CardSkeleton";

const FavoritesModalSkeleton: React.FC = () => {
  return (
    <div className={s.backdrop}>
      <div className={s.modal}>
        <div className={s.topbarListBlock}>
          <div className={s.topbar}>
            <Skeleton
              width={180}
              height={32}
              baseColor="rgba(217, 186, 136, 0.1)"
              highlightColor="rgba(217, 186, 136, 0.2)"
            />
            <Skeleton
              width={46}
              height={46}
              borderRadius={10}
              baseColor="rgba(217, 186, 136, 0.1)"
              highlightColor="rgba(217, 186, 136, 0.2)"
            />
          </div>

          <div className={s.list}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={s.skeletonCardWrapper}>
                <CardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesModalSkeleton;
