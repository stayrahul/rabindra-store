// Force server-side evaluation for SEO
import { supabase } from "@/utils/supabase";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: product } = await supabase.from('products').select('nameEn, category, description').eq('id', id).single();
  
  if (!product) return { title: 'Product Not Found | Rabindra Store' };

  return {
    title: `${product.nameEn} | ${product.category} | Rabindra Store`,
    description: product.description || `Buy ${product.nameEn} at wholesale rates in Simraungadh.`,
    openGraph: {
      title: `${product.nameEn} Wholesale`,
      description: `Premium ${product.category} supplier in Nepal.`,
    }
  };
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <ProductDetailsClient id={id} />;
}