"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { cancelOrder, fulfillOrder, getOrderById } from '../../../utils/api';

// Order type definition for TypeScript
type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    description?: string;
    images?: { url: string }[];
  };
};

type Order = {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
};

export default function OrderDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [fulfillLoading, setFulfillLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) return;
      
      try {
        setLoading(true);
        const response = await getOrderById(orderId);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrder();
    }
  }, [user, orderId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?returnTo=/account/orders');
    }
  }, [user, authLoading, router]);

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function for order status
  const getStatusBadge = (status: string) => {
    let colorClass = '';
    const statusDisplay = status.charAt(0) + status.slice(1).toLowerCase();
    
    switch (status) {
      case 'DELIVERED':
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        break;
      case 'SHIPPED':
        colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        break;
      case 'PROCESSING':
        colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        break;
      case 'CANCELLED':
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {statusDisplay}
      </span>
    );
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      setCancelLoading(true);
      setError(null);
      
      await cancelOrder(order.id);
      
      // Refresh order data
      const response = await getOrderById(orderId);
      setOrder(response.data);
      setSuccessMessage('Order has been cancelled successfully.');
      
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle fulfill order (mark as delivered)
  const handleFulfillOrder = async () => {
    if (!order) return;
    
    try {
      setFulfillLoading(true);
      setError(null);
      
      await fulfillOrder(order.id);
      
      // Refresh order data
      const response = await getOrderById(orderId);
      setOrder(response.data);
      
      const successMsg = order.status === 'PENDING'
        ? 'Order has been marked as fulfilled successfully.'
        : 'Order has been marked as delivered successfully.';
      
      setSuccessMessage(successMsg);
      
    } catch (err) {
      console.error('Error fulfilling order:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setFulfillLoading(false);
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

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="p-4 bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/account/orders"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Order #{order.id}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                {getStatusBadge(order.status)}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-50 dark:bg-green-900 border-b border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-300">{successMessage}</p>
            </div>
          )}

          <div className="p-4">
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Order Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {formatDate(order.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Order Items</h4>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-20 h-20 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          <Link href={`/shop/product/${item.productId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                            {item.product.name}
                          </Link>
                        </h5>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {item.product.description || 'No description available'}
                        </p>
                        <div className="mt-2 flex justify-between">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t dark:border-gray-700 pt-6">
              <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                <p>Subtotal</p>
                <p>${Number(order.total).toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Shipping and taxes included.
              </p>
            </div>

            <div className="mt-6 flex gap-4">
              <Link
                href="/account/orders"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-center"
              >
                Back to Orders
              </Link>
              
              {order.status === 'PENDING' && (
                <>
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelLoading || fulfillLoading}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                  <button
                    onClick={handleFulfillOrder}
                    disabled={cancelLoading || fulfillLoading}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                  >
                    {fulfillLoading ? 'Processing...' : 'Mark as Fulfilled'}
                  </button>
                </>
              )}
              
              {order.status === 'SHIPPED' && (
                <button
                  onClick={handleFulfillOrder}
                  disabled={fulfillLoading}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {fulfillLoading ? 'Processing...' : 'Mark as Delivered'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 