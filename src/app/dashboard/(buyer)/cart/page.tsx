import React from 'react';
import CartList from '@/components/dashboard/buyer/CartList';

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <CartList />
    </div>
  );
}