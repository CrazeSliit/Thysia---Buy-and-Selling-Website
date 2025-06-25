'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ShoppingCart, Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface AddToCartButtonProps {
  productId: string
  stock: number
  isActive: boolean
  className?: string
}

export default function AddToCartButton({ 
  productId, 
  stock, 
  isActive, 
  className = '' 
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const router = useRouter()

  const addToCart = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId, 
          quantity: 1 
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in to add items to cart')
          router.push('/auth/signin?callbackUrl=/products')
          return
        }
        throw new Error('Failed to add item to cart')
      }

      const data = await response.json()
      toast.success('Item added to cart successfully!')
      
      // Optional: Show a quick action to go to cart
      setTimeout(() => {
        toast.info('View Cart', {
          action: {
            label: 'Go to Cart',
            onClick: () => router.push('/dashboard/buyer/cart')
          }
        })
      }, 1000)

    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async () => {
    setAddingToWishlist(true)
    try {
      const response = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in to add items to wishlist')
          router.push('/auth/signin?callbackUrl=/products')
          return
        }
        if (response.status === 409) {
          toast.info('Item is already in your wishlist')
          return
        }
        throw new Error('Failed to add item to wishlist')
      }

      toast.success('Item added to wishlist!')
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Failed to add item to wishlist')
    } finally {
      setAddingToWishlist(false)
    }
  }

  const isDisabled = !isActive || stock === 0

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        onClick={addToCart}
        disabled={isDisabled || loading}
        className="flex-1 h-9"
        size="sm"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <ShoppingCart className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Adding...' : isDisabled ? 'Out of Stock' : 'Add to Cart'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={addToWishlist}
        disabled={addingToWishlist}
        className="p-2"
      >
        {addingToWishlist ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}
