"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../utils/api';

// Order type definition for TypeScript
type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    images?: { url: string }[];
  };
};

type Order = {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
};

function OrdersContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  
  // Check for success parameter in URL
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await getUserOrders();
        setOrders(response.data);
        
        // If this is a redirect from a successful order creation, highlight that order
        if (success === 'true' && orderId) {
          setActiveOrderId(Number(orderId));
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrders();
    }
  }, [user, success, orderId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?returnTo=/account/orders');
    }
  }, [user, authLoading, router]);

  const toggleOrderDetails = (orderId: number) => {
    if (activeOrderId === orderId) {
      setActiveOrderId(null);
    } else {
      setActiveOrderId(orderId);
    }
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format status for display
  const getStatusDisplay = (status: string) => {
    // Convert PENDING to Pending, DELIVERED to Delivered, etc.
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Helper function to determine text color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600 dark:text-green-400';
      case 'SHIPPED':
        return 'text-blue-600 dark:text-blue-400';
      case 'PROCESSING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'CANCELLED':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (authLoading || loading) {
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
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}
          
          {success === 'true' && (
            <div className="p-4 bg-green-50 dark:bg-green-900 border-b border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-300">
                Your order has been placed successfully!
              </p>
            </div>
          )}
          
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
                          Placed on {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${Number(order.total).toFixed(2)}
                        </div>
                        <div className={`text-sm ${getStatusColor(order.status)}`}>
                          {getStatusDisplay(order.status)}
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
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="py-3 flex justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${(Number(item.price) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                          <div className="flex justify-between text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">Total</p>
                            <p className="font-medium text-gray-900 dark:text-white">${Number(order.total).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 text-center"
                          >
                            View Order Details
                          </Link>
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

// Loading fallback component
function OrdersLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersContent />
    </Suspense>
  );
} 