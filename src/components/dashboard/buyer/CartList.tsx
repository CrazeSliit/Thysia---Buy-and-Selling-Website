'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CartItem {
  id: string
  quantity: number
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    description: string
    price: number
    imageUrl: string
    stock: number
    isActive: boolean
    category: {
      name: string
    }
    seller: {
      id: string
      businessName: string | null
    }
    createdAt: string
    updatedAt: string
  }
}

interface CartSummary {
  totalItems: number
  totalAmount: number
  itemCount: number
}

interface CartResponse {
  cartItems: CartItem[]
  summary: CartSummary
}

export default function CartList() {
  const [cartData, setCartData] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingItem, setUpdatingItem] = useState<string | null>(null)

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (!response.ok) {
        throw new Error('Failed to fetch cart items')
      }
      const data = await response.json()
      setCartData(data)
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Failed to load cart items')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, productId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdatingItem(itemId)
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: newQuantity,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update quantity')
      }

      await fetchCartItems()
      toast.success('Cart updated successfully')
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    } finally {
      setUpdatingItem(null)
    }
  }

  const removeItem = async (itemId: string, productId: string) => {
    setUpdatingItem(itemId)
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove item')
      }

      await fetchCartItems()
      toast.success('Item removed from cart')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    } finally {
      setUpdatingItem(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!cartData || cartData.cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-600 mb-4">Add some products to get started</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="space-y-4">
        {cartData.cartItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.product.imageUrl || '/placeholder-product.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link 
                          href={`/products/${item.product.id}`}
                          className="hover:text-blue-600"
                        >
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Category: {item.product.category.name}
                      </p>
                      {item.product.seller.businessName && (
                        <p className="text-sm text-gray-600">
                          Seller: {item.product.seller.businessName}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={item.product.isActive ? 'default' : 'destructive'}>
                          {item.product.isActive ? 'Available' : 'Unavailable'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {item.product.stock} in stock
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        ${item.product.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItem === item.id}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="px-3 py-1 text-sm font-medium bg-gray-100 rounded">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock || updatingItem === item.id}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id, item.product.id)}
                      disabled={updatingItem === item.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Items ({cartData.summary.totalItems})</span>
              <span>${cartData.summary.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${cartData.summary.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
