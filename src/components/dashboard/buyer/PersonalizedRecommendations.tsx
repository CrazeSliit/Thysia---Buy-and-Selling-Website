'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Zap, 
  Star, 
  Heart, 
  ShoppingCart, 
  Clock, 
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  Crown,
  Timer,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  category: string
  stock: number
  isNew?: boolean
  isBestseller?: boolean
  discount?: number
}

interface Recommendation {
  id: string
  title: string
  reason: string
  type: 'PERSONALIZED' | 'TRENDING' | 'FLASH_DEAL' | 'SIMILAR' | 'RESTOCK' | 'PRICE_DROP'
  products: Product[]
  confidence: number
  icon?: React.ReactNode
  badge?: string
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH'
  expiresAt?: string
}

interface PersonalizedRecommendationsProps {
  userId: string
}

export default function PersonalizedRecommendations({ userId }: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'deals' | 'personal'>('all')

  useEffect(() => {
    fetchRecommendations()
  }, [userId])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      
      // Simulated API call - in real app this would fetch from AI recommendation service
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          title: 'Perfect Matches for You',
          reason: 'Based on your recent purchases and browsing history',
          type: 'PERSONALIZED',
          confidence: 92,
          icon: <Target className="w-5 h-5" />,
          badge: 'AI Powered',
          products: [
            {
              id: 'p1',
              name: 'Premium Wireless Headphones',
              price: 199.99,
              originalPrice: 249.99,
              image: '/api/placeholder/200/200',
              rating: 4.8,
              reviewCount: 1247,
              category: 'Electronics',
              stock: 23,
              discount: 20
            },
            {
              id: 'p2',
              name: 'Smart Fitness Watch',
              price: 299.99,
              image: '/api/placeholder/200/200',
              rating: 4.6,
              reviewCount: 892,
              category: 'Wearables',
              stock: 45,
              isNew: true
            }
          ]
        },
        {
          id: '2',
          title: 'Trending This Week',
          reason: 'Hot items other buyers are loving',
          type: 'TRENDING',
          confidence: 85,
          icon: <TrendingUp className="w-5 h-5" />,
          badge: 'Trending',
          products: [
            {
              id: 'p3',
              name: 'Eco-Friendly Water Bottle',
              price: 24.99,
              image: '/api/placeholder/200/200',
              rating: 4.9,
              reviewCount: 456,
              category: 'Lifestyle',
              stock: 78,
              isBestseller: true
            },
            {
              id: 'p4',
              name: 'Minimalist Desk Organizer',
              price: 39.99,
              originalPrice: 49.99,
              image: '/api/placeholder/200/200',
              rating: 4.7,
              reviewCount: 234,
              category: 'Office',
              stock: 12,
              discount: 20
            }
          ]
        },
        {
          id: '3',
          title: 'Flash Deals - Limited Time!',
          reason: 'Exclusive discounts ending soon',
          type: 'FLASH_DEAL',
          confidence: 95,
          icon: <Zap className="w-5 h-5" />,
          badge: 'Flash Deal',
          urgency: 'HIGH',
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          products: [
            {
              id: 'p5',
              name: 'Professional Coffee Maker',
              price: 129.99,
              originalPrice: 199.99,
              image: '/api/placeholder/200/200',
              rating: 4.5,
              reviewCount: 567,
              category: 'Kitchen',
              stock: 8,
              discount: 35
            }
          ]
        },
        {
          id: '4',
          title: 'Price Drops Alert',
          reason: 'Items from your wishlist are now cheaper',
          type: 'PRICE_DROP',
          confidence: 88,
          icon: <ArrowDown className="w-5 h-5 text-green-600" />,
          badge: 'Price Drop',
          urgency: 'MEDIUM',
          products: [
            {
              id: 'p6',
              name: 'Designer Backpack',
              price: 89.99,
              originalPrice: 129.99,
              image: '/api/placeholder/200/200',
              rating: 4.4,
              reviewCount: 789,
              category: 'Fashion',
              stock: 34,
              discount: 31
            }
          ]
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredRecommendations = () => {
    switch (activeTab) {
      case 'trending':
        return recommendations.filter(r => r.type === 'TRENDING')
      case 'deals':
        return recommendations.filter(r => r.type === 'FLASH_DEAL' || r.type === 'PRICE_DROP')
      case 'personal':
        return recommendations.filter(r => r.type === 'PERSONALIZED' || r.type === 'SIMILAR')
      default:
        return recommendations
    }
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200'
      case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'PERSONALIZED': return 'bg-purple-100 text-purple-800'
      case 'TRENDING': return 'bg-blue-100 text-blue-800'
      case 'FLASH_DEAL': return 'bg-red-100 text-red-800'
      case 'PRICE_DROP': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m left`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Personalized for You</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="bg-gray-50 rounded-lg p-3">
                    <div className="w-full h-32 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header with Tabs */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
          <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full">
            AI Powered
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', icon: <Sparkles className="w-4 h-4" /> },
            { key: 'personal', label: 'For You', icon: <Target className="w-4 h-4" /> },
            { key: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
            { key: 'deals', label: 'Deals', icon: <Zap className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Content */}
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {getFilteredRecommendations().map((recommendation) => (
          <div key={recommendation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Recommendation Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-2">
                <div className="flex items-center space-x-2">
                  {recommendation.icon}
                  <div>
                    <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                    <p className="text-sm text-gray-600">{recommendation.reason}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(recommendation.type)}`}>
                  {recommendation.badge}
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <BarChart3 className="w-3 h-3" />
                  <span>{recommendation.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Urgency Indicator */}
            {recommendation.urgency && (
              <div className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-md border mb-3 ${getUrgencyColor(recommendation.urgency)}`}>
                <Timer className="w-3 h-3" />
                <span>
                  {recommendation.expiresAt 
                    ? formatTimeRemaining(recommendation.expiresAt)
                    : `${recommendation.urgency.toLowerCase()} priority`
                  }
                </span>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendation.products.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  <div className="relative">
                    <div className="w-full h-32 bg-gray-300 rounded mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                        <span className="text-gray-600 text-sm">{product.category}</span>
                      </div>
                    </div>
                    
                    {/* Product Badges */}
                    <div className="absolute top-2 left-2 flex flex-col space-y-1">
                      {product.isNew && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">New</span>
                      )}
                      {product.isBestseller && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Bestseller</span>
                        </span>
                      )}
                      {product.discount && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          -{product.discount}%
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50">
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-sm text-gray-900 line-clamp-2">{product.name}</h5>
                    
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{product.stock} left</span>
                    </div>

                    <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            <button className="w-full mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center space-x-1 py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
              <span>View More {recommendation.title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}

        {getFilteredRecommendations().length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recommendations available for this category yet.</p>
            <p className="text-sm text-gray-400 mt-1">Keep shopping to get personalized suggestions!</p>
          </div>
        )}
      </div>

      {/* Footer with AI Insights */}
      <div className="border-t p-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Powered by AI • Updated in real-time</span>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Customize preferences →
          </button>
        </div>
      </div>
    </div>
  )
}
