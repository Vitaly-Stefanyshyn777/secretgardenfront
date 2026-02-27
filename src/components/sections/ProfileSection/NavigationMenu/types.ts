import React from "react";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  // Дозволяємо і компонент, і рядок
  icon: React.ComponentType<{ className?: string }> | string;
  badge?: number;
}
