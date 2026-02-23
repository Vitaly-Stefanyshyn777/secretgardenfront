"use client";
import {
  fetchUserSubscription,
  type UserSubscription,
} from "@/lib/bfbApi";
import { useAuthStore } from "@/store/auth";
import React, { useEffect, useState } from "react";
import SectionDivider from "../SectionDivider/SectionDivider";
import CurrentPlanCardCurrent from "./CurrentPlanCardCurrent";
import PlansGrid from "./PlansGrid";
import styles from "./SubscriptionCurrent.module.css";
import SubscriptionHeader from "./SubscriptionHeader";
import SubscriptionHistory from "./SubscriptionHistory";

const SubscriptionCurrent: React.FC = () => {
  const [subscriptionData, setSubscriptionData] =
    useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("wp_jwt") ||
              localStorage.getItem("wp_jwt_override") ||
              undefined
            : undefined;

        const data = await fetchUserSubscription(Number(user.id), token);
        setSubscriptionData(data);
      } catch {
        // Silent error handling
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionData();
  }, [user?.id]);

  const hasActivePlan = !!subscriptionData?.currentPlan;

  return (
    <div className={styles.subscriptionContainer}>
      <SubscriptionHeader showBackButton={false} />
      <div className={styles.mobileTitleDivider} />
      <SectionDivider />

      <div className={styles.content}>
        {!isLoading && !hasActivePlan ? (
          <PlansGrid />
        ) : (
          <>
            <CurrentPlanCardCurrent />
            <div className={styles.mobileTitleDivider} />
            <SubscriptionHistory />
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCurrent;
