import type { Metadata } from "next";
import ProductReviewsListPage from "@/components/sections/ProductsSection/ProductPage/ProductReviewsListPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Відгуки | ${slug}`,
  };
}

export default async function ReviewsRoute({ params }: PageProps) {
  const { slug } = await params;
  return <ProductReviewsListPage productSlug={slug} />;
}
