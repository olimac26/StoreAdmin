// app/pos/page.tsx
'use client';

import { POSLayout } from '@/components/pos/PosLayout';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { usePOS } from '@/app/hooks/use-pos';

export default function POSPage() {
  const pos = usePOS();

  return (
    <POSLayout>
      <ProductGrid
        products={pos.products}
        onAdd={pos.addToCart}
        searchQuery={pos.searchQuery}
        onSearch={pos.setSearchQuery}
        activeCategory={pos.activeCategory}
        onCategory={pos.setActiveCategory}
      />
      <Cart
        items={pos.cartItems}
        onChangeQty={pos.changeQty}
        onClear={pos.clearCart}
        onCheckout={pos.checkout}
        payMethod={pos.payMethod}
        onPayMethod={pos.setPayMethod}
        subtotal={pos.subtotal}
        discount={pos.discount}
        total={pos.total}
      />
    </POSLayout>
  );
}
