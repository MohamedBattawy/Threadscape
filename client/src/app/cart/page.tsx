"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { clearCart, createOrder, removeFromCart, updateCartItem } from '../utils/api';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<{ [key: number]: boolean }>({});
  const [removingItems, setRemovingItems] = useState<{ [key: number]: boolean }>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Update item quantity
  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      await updateCartItem(itemId, newQuantity);
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      console.error('Error updating cart item:', err);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId: number) => {
    try {
      setRemovingItems(prev => ({ ...prev, [itemId]: true }));
      await removeFromCart(itemId);
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      console.error('Error removing cart item:', err);
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      await clearCart();
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      console.error('Error clearing cart:', err);
    }
  };

  // Handle checkout and create order
  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      setError(null);
      
      if (!cart || cart.items.length === 0) {
        setError('Your cart is empty');
        return;
      }
      
      // Create order - the backend will handle clearing the cart
      const result = await createOrder();
      
      // Refresh cart after successful order
      await refreshCart();
      
      // Redirect to order confirmation page
      router.push(`/account/orders?success=true&orderId=${result.order.id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      console.error('Error during checkout:', err);
      setIsCheckingOut(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?returnTo=/cart');
    }
  }, [user, authLoading, router]);

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // The useEffect will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b dark:border-gray-700 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Your Shopping Cart</h1>
              {cart?.itemCount ? (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
                </p>
              ) : null}
            </div>
            {cart?.items && cart.items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear Cart
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="p-4">
            {!cart?.items || cart.items.length === 0 ? (
              <div className="text-center py-16">
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Your cart is empty</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Looks like you haven&apos;t added any items to your cart yet.
                </p>
                <div className="mt-6">
                  <Link 
                    href="/shop" 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
                    {cart.items.map((item) => (
                      <li key={item.id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                          {item.product.images?.length > 0 ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-500 dark:text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                              <h3>
                                <Link href={`/shop/product/${item.productId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                  {item.product.name}
                                </Link>
                              </h3>
                              <p className="ml-4">${Number(item.product.price).toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {item.product.description}
                            </p>
                          </div>
                          
                          {item.product.status === 'discontinued' ? (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                              This product is no longer available
                            </p>
                          ) : item.product.status === 'out_of_stock' ? (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                              This product is currently out of stock
                            </p>
                          ) : item.product.status === 'limited_stock' ? (
                            <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                              Limited stock available
                            </p>
                          ) : null}
                          
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center">
                              <span className="text-gray-500 dark:text-gray-400 mr-3">Qty</span>
                              <div className="flex border border-gray-300 dark:border-gray-600 rounded">
                                <button
                                  className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updatingItems[item.id] || removingItems[item.id]}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  min="1"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value >= 1) handleUpdateQuantity(item.id, value);
                                  }}
                                  className="w-12 text-center border-0 focus:ring-0 dark:bg-gray-800 text-gray-900 dark:text-white"
                                  disabled={updatingItems[item.id] || removingItems[item.id]}
                                />
                                <button
                                  className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  disabled={updatingItems[item.id] || removingItems[item.id]}
                                >
                                  +
                                </button>
                              </div>
                              {updatingItems[item.id] && (
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Updating...</span>
                              )}
                            </div>
                            
                            <div className="flex">
                              <button
                                type="button"
                                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={updatingItems[item.id] || removingItems[item.id]}
                              >
                                {removingItems[item.id] ? 'Removing...' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {cart?.items && cart.items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 py-6 px-4 sm:px-6">
              <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                <p>Subtotal</p>
                <p>${cart.subtotal.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                      Processing...
                    </>
                  ) : (
                    'Checkout'
                  )}
                </button>
              </div>
              <div className="mt-6 flex justify-center text-sm text-center text-gray-500 dark:text-gray-400">
                <p>
                  or{' '}
                  <Link href="/shop" className="text-indigo-600 font-medium hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Continue Shopping<span aria-hidden="true"> &rarr;</span>
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 