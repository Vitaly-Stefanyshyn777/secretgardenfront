"use client";

import {
  cancelSubscription,
  fetchUserSubscription,
  type UserSubscription,
} from "@/lib/bfbApi";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./SubscriptionCurrent.module.css";

export default function CurrentPlanCard() {
  const [subscriptionData, setSubscriptionData] =
    useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const user = useAuthStore((s) => s.user);

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
    } catch (err) {
      setError("Не вдалося завантажити інформацію про підписку");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, [user?.id]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleCancel = async () => {
    const userId = user?.id ? Number(user.id) : NaN;
    if (!Number.isFinite(userId) || userId <= 0) return;
    if (!confirm("Скасувати підписку?")) return;

    try {
      setIsCancelling(true);
      await cancelSubscription({ userId });
      await loadSubscriptionData();
      alert("Підписку скасовано.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Невідома помилка";
      alert(`Не вдалося скасувати підписку. ${msg}`);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.currentPlan}>
        <div className={styles.currentPlanContainer}>Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.currentPlan}>
        <div className={styles.currentPlanContainer}>{error}</div>
      </div>
    );
  }

  const plan = subscriptionData?.currentPlan;

  return (
    <div className={styles.currentPlan}>
      {plan ? (
        <div className={styles.currentPlanContainer}>
          <div className={styles.planInfoBlock}>
            <h4 className={styles.planName}>{plan.name}</h4>
            <div className={styles.planFeatures}>
              {(plan.features || []).slice(0, 3).map((f, idx) => (
                <div key={idx} className={styles.feature}>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {isMobile ? (
            <div className={styles.priceAndPaymentContainer}>
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Ціна підписки;</span>
                <div className={styles.priceInfo}>
                  <div className={styles.priceAmountBlock}>
                    <span className={styles.priceAmount}>{plan.price}</span>
                    <span className={styles.priceCurrency}>$</span>
                  </div>
                  <span className={styles.pricePeriodSeparator}>/</span>
                  <span className={styles.pricePeriod}>місяць</span>
                </div>
              </div>

              <div className={styles.nextPaymentBlock}>
                <span className={styles.nextPaymentLabel}>Наступне списання</span>
                <span className={styles.nextPaymentDate}>
                  {plan.nextPaymentDate || "Не вказано"}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Ціна підписки;</span>
                <div className={styles.priceInfo}>
                  <div className={styles.priceAmountBlock}>
                    <span className={styles.priceAmount}>{plan.price}</span>
                    <span className={styles.priceCurrency}>$</span>
                  </div>
                  <span className={styles.pricePeriodSeparator}>/</span>
                  <span className={styles.pricePeriod}>місяць</span>
                </div>
              </div>

              <div className={styles.nextPaymentBlock}>
                <span className={styles.nextPaymentLabel}>Наступне списання</span>
                <span className={styles.nextPaymentDate}>
                  {plan.nextPaymentDate || "Не вказано"}
                </span>
              </div>
            </>
          )}

          <div className={styles.actionsBlock}>
            <Link href="/profile/subscription" className={styles.changePlanBtn}>
              Змінити план
            </Link>
            {plan && (
              <button
                className={styles.cancelBtn}
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Скасовуємо..." : "Скасувати"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.noPlanMessage}>
          <p>Немає тарифу</p>
        </div>
      )}
    </div>
  );
}
