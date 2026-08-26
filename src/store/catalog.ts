import { create } from "zustand";
import type { SortType } from "@/components/ui/FilterSortPanel/FilterSortPanel";

type CatalogState = {
  sortBy: SortType;
  searchTerm: string;
  setSortBy: (sortBy: SortType) => void;
  setSearchTerm: (searchTerm: string) => void;
  resetCatalogUi: () => void;
};

export const useCatalogStore = create<CatalogState>((set) => ({
  sortBy: "popular",
  searchTerm: "",
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  resetCatalogUi: () => set({ sortBy: "popular", searchTerm: "" }),
}));
