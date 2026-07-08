import { supabaseFetch } from '@/lib/supabase';
import ShopDetailClient from './ShopDetailClient';

export const dynamic = 'force-dynamic';

export default async function ShopDetailPage({ params }) {
  const { id } = params;

  // Fetch shop info
  const shopData = await supabaseFetch(`shops?id=eq.${id}&select=*`);
  const shop = shopData && shopData.length > 0 ? shopData[0] : null;

  if (!shop) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>দোকানটি পাওয়া যায়নি</h2>
      </div>
    );
  }

  // Fetch products for this shop
  const products = await supabaseFetch(
    `products?shop_id=eq.${id}&is_available=eq.true&select=*&order=sort_order.asc`
  );

  return (
    <ShopDetailClient shop={shop} products={products || []} />
  );
}
