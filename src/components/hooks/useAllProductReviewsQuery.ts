"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllProductReviews } from "@/lib/bfbApi";
import { useLanguageStore } from "@/store/language";

export function useAllProductReviewsQuery(limit = 50) {
  const locale = useLanguageStore((s) => s.locale);
  return useQuery({
    queryKey: ["catalog", "reviews", "all", locale, limit],
    queryFn: () => fetchAllProductReviews(limit),
    staleTime: 60_000,
  });
}
