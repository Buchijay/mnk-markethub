'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
  Package,
  Truck,
  ShieldCheck,
} from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  vendor_id: string
  vendor_name: string
  slug: string
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [])

  function loadCart() {
    const items: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(items)
  }

  function saveCart(items: CartItem[]) {
    localStorage.setItem('cart', JSON.stringify(items))
    setCart(items)
    window.dispatchEvent(new Event('cartUpdated'))
  }

  function updateQuantity(id: string, delta: number) {
    const updated = cart.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    saveCart(updated)
  }

  function removeItem(id: string) {
    const updated = cart.filter((item) => item.id !== id)
    saveCart(updated)
    toast.success('Item removed from cart')
  }

  function clearCart() {
    saveCart([])
    toast.success('Cart cleared')
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = subtotal > 50000 ? 0 : 2500
  const total = subtotal + shippingFee

  if (!mounted) return null

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={80} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold transition shadow-lg shadow-amber-200"
          >
            <ShoppingCart size={20} />
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  // Group by vendor
  const grouped = cart.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.vendor_id
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/products" className="text-gray-500 hover:text-gray-700 transition">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(grouped).map(([vendorId, items]) => (
              <div key={vendorId} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                {/* Vendor Header */}
                <div className="bg-gray-50 px-6 py-3 border-b flex items-center gap-2">
                  <Package size={16} className="text-amber-600" />
                  <span className="font-semibold text-gray-700">{items[0].vendor_name}</span>
                  <span className="text-sm text-gray-400">({items.length} item{items.length > 1 ? 's' : ''})</span>
                </div>

                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 flex gap-4">
                      {/* Image */}
                      <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                        <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={28} />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`} className="font-bold text-gray-900 hover:text-amber-600 transition line-clamp-2">
                          {item.name}
                        </Link>
                        <p className="text-amber-600 font-bold text-lg mt-1">{formatPrice(item.price)}</p>

                        {/* Quantity Control */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-3 py-1.5 hover:bg-gray-100 transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-4 py-1.5 font-bold bg-gray-50 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-3 py-1.5 hover:bg-gray-100 transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-400 hover:text-red-600 transition p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-gray-400">
                    Free shipping on orders above {formatPrice(50000)}
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-amber-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-lg font-bold transition shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="w-full mt-3 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={18} className="text-blue-600 flex-shrink-0" />
                  <span>Fast & reliable delivery nationwide</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck size={18} className="text-green-600 flex-shrink-0" />
                  <span>Secure checkout & buyer protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
