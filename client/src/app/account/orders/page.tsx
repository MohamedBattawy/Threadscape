"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Sample order data for demonstration
const sampleOrders = [
  {
    id: '1001',
    date: '2023-12-15',
    total: 89.97,
    status: 'Delivered',
    items: [
      { id: 'p1', name: 'Men&apos;s Classic T-Shirt', quantity: 2, price: 29.99 },
      { id: 'p2', name: 'Women&apos;s Slim Jeans', quantity: 1, price: 49.99 }
    ]
  },
  {
    id: '1002',
    date: '2024-01-20',
    total: 125.98,
    status: 'Processing',
    items: [
      { id: 'p3', name: 'Leather Wallet', quantity: 1, price: 35.99 },
      { id: 'p4', name: 'Women&apos;s Summer Dress', quantity: 1, price: 89.99 }
    ]
  }
];

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders] = useState(sampleOrders);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?returnTo=/account/orders');
    }
  }, [user, loading, router]);

  const toggleOrderDetails = (orderId: string) => {
    if (activeOrderId === orderId) {
      setActiveOrderId(null);
    } else {
      setActiveOrderId(orderId);
    }
  };

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Order History
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              View your past orders and their statuses
            </p>
          </div>
          
          <div className="p-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You haven&apos;t placed any orders yet.
                </p>
                <div className="mt-6">
                  <Link 
                    href="/shop" 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                    <div 
                      className="p-4 bg-gray-50 dark:bg-gray-700 flex flex-wrap justify-between items-center cursor-pointer"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Order #{order.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${order.total.toFixed(2)}
                        </div>
                        <div className={`text-sm ${
                          order.status === 'Delivered' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                      <div className="w-full sm:w-auto mt-2 sm:mt-0">
                        <button
                          type="button"
                          className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                        >
                          <span>{activeOrderId === order.id ? 'Hide Details' : 'View Details'}</span>
                          <svg 
                            className={`ml-1 h-5 w-5 transition-transform ${activeOrderId === order.id ? 'rotate-180' : ''}`} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor" 
                            aria-hidden="true"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {activeOrderId === order.id && (
                      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Order Items</h4>
                          <div className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
                            {order.items.map((item) => (
                              <div key={item.id} className="py-3 flex justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                          <div className="flex justify-between text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">Total</p>
                            <p className="font-medium text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 text-center"
                          >
                            View Order Details
                          </Link>
                          {order.status === 'Delivered' && (
                            <button
                              type="button"
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                              Buy Again
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 