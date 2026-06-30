'use client';
import { Cart } from '@/components/pos/Cart';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { usePOS } from '../hooks/use-pos';

export default function Home() {
  const pos = usePOS();

  return (
    <div className="flex h-full bg-background overflow-hidden">
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
    </div>
  );
}
