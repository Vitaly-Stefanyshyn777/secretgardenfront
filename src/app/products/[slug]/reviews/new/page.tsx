import type { Metadata } from "next";
import ProductLeaveReviewPage from "@/components/sections/ProductsSection/ProductPage/ProductLeaveReviewPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Залишити відгук | ${slug}`,
  };
}

export default async function LeaveReviewRoute({ params }: PageProps) {
  const { slug } = await params;
  return <ProductLeaveReviewPage productSlug={slug} />;
}
