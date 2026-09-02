import type { Metadata } from "next";
import ProductCharacteristicsPage from "@/components/sections/ProductsSection/ProductPage/ProductCharacteristicsPage";
import { resolveProductSlugParam } from "@/lib/slugUtils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Характеристика та особливості | ${slug}`,
  };
}

export default async function CharacteristicsRoute({ params }: PageProps) {
  const { slug } = await params;
  return (
    <ProductCharacteristicsPage
      productSlug={resolveProductSlugParam(slug)}
    />
  );
}
