import ProductPage from "@/components/sections/ProductsSection/ProductPage/ProductPageNew";
import type { Metadata } from "next";
import { fetchProductSeo, yoastToMetadata } from "@/lib/seoUtils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const yoast = await fetchProductSeo(slug);
  return yoastToMetadata(yoast);
}

export default async function ProductPageRoute({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductPage productSlug={slug} />;
}
