// components/ShopSection.js
import { supabaseFetch } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function ShopSection() {
  const shops = await supabaseFetch(
    `shops?is_active=eq.true&order=is_featured.desc,created_at.desc`
  );

  if (!shops || shops.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        এই মুহূর্তে কোনো shop পাওয়া যায়নি
      </div>
    );
  }

  return (
    <section className="px-4 py-4">
      <h2 className="text-lg font-semibold mb-3">সব দোকান</h2>
      <div className="grid grid-cols-2 gap-3">
        {shops.map((shop) => (
          <a
            key={shop.id}
            href={`/shops/${shop.id}`}
            className="border rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <img
              src={shop.image_url || '/placeholder-shop.png'}
              alt={shop.name}
              className="w-full h-24 object-cover"
            />
            <div className="p-2">
              <p className="font-medium text-sm truncate">{shop.name}</p>
              <p className="text-xs text-gray-500">{shop.category}</p>
              <div className="flex items-center gap-1 text-xs mt-1">
                <span>⭐ {shop.rating || 'নতুন'}</span>
                <span className="text-gray-400">
                  · {shop.delivery_time_min}-{shop.delivery_time_max} মিনিট
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
