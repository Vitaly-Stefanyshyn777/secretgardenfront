"use client";

import { useEffect, useState } from "react";
import {
  isCourierDeliveryAvailable,
  msUntilNextCourierAvailabilityChange,
} from "@/lib/courierDeliveryHours";

export function useCourierDeliveryAvailable() {
  const [available, setAvailable] = useState(() =>
    isCourierDeliveryAvailable(),
  );

  useEffect(() => {
    const sync = () => setAvailable(isCourierDeliveryAvailable());
    sync();

    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeoutId = setTimeout(() => {
        sync();
        schedule();
      }, msUntilNextCourierAvailabilityChange());
    };
    schedule();

    const intervalId = setInterval(sync, 60_000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return available;
}
