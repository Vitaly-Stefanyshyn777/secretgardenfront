import type { SortType } from "@/components/ui/FilterSortPanel/FilterSortPanel";

export interface SortableItem {
  id: string | number;
  price?: number | string;
  regularPrice?: number | string;
  salePrice?: number | string;
  dateCreated?: string;
  date_created?: string;
  onSale?: boolean;
  featured?: boolean;
  total_sales?: number;
  ratingAverage?: number | null;
  ratingCount?: number | null;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getEffectivePrice(item: SortableItem): number {
  const sale = toNumber(item.salePrice);
  if (sale > 0) return sale;
  return toNumber(item.price);
}

function getPopularScore(item: SortableItem): number {
  const sales = toNumber(item.total_sales);
  if (sales > 0) return sales * 1000;
  const rating = toNumber(item.ratingAverage);
  const count = toNumber(item.ratingCount);
  return rating * Math.max(count, 1);
}

export function sortItems<T extends SortableItem>(
  items: T[],
  sortType: SortType
): T[] {
  const sorted = [...items];

  switch (sortType) {
    case "popular":
      return sorted.sort((a, b) => {
        const scoreDiff = getPopularScore(b) - getPopularScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return getEffectivePrice(a) - getEffectivePrice(b);
      });

    case "new":
      return sorted.sort((a, b) => {
        const dateA = new Date(a.dateCreated || a.date_created || 0).getTime();
        const dateB = new Date(b.dateCreated || b.date_created || 0).getTime();
        return dateB - dateA;
      });

    case "sale":
      return sorted.filter((item) => item.onSale);

    case "price_desc":
      return sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));

    case "price_asc":
      return sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));

    default:
      return sorted;
  }
}

export function paginateItems<T>(
  items: T[],
  page: number,
  perPage: number
): T[] {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return items.slice(start, end);
}
