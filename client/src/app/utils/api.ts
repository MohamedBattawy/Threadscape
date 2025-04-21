// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Common headers used in requests
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Handle API response
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // If the server responded with an error message
    if (data.message) {
      throw new Error(data.message);
    }
    // If there are validation errors
    if (data.errors && Array.isArray(data.errors)) {
      throw new Error(data.errors.join(', '));
    }
    // Generic error based on status
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return data;
};

// Create a new user
export const createUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address?: string;
  city?: string;
  country?: string;
  role?: string;
}) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

// Register a new user (legacy - use createUser instead)
export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address?: string;
  city?: string;
  country?: string;
}) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

// Login a user
export const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
    body: JSON.stringify(credentials),
  });
  
  return handleResponse(response);
};

// Logout a user
export const logoutUser = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
};

// Update user profile
export const updateUserProfile = async (userData: {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  country?: string;
}) => {
  // First get the current user to get the ID
  const userResponse = await getCurrentUser();
  const userId = userResponse.data.id;
  
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

// Delete current user account
export const deleteUserAccount = async () => {
  // First get the current user to get the ID
  const userResponse = await getCurrentUser();
  const userId = userResponse.data.id;
  
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
};

// Change user password
export const changeUserPassword = async (passwordData: { 
  currentPassword: string; 
  newPassword: string; 
}) => {
  const response = await fetch(`${API_URL}/users/change-password`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
    body: JSON.stringify(passwordData),
  });
  
  return handleResponse(response);
};

// Product related API calls
// -------------------------

// Get all products with optional filtering
export const getProducts = async ({ 
  page = 1, 
  limit = 12,
  sort = 'newest',
  category = null
}: { 
  page?: number, 
  limit?: number,
  sort?: string,
  category?: string | null
}) => {
  // Build query string
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('sort', sort);
  if (category) {
    params.append('category', category);
  }
  
  const response = await fetch(`${API_URL}/products?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store'
  });
  
  return handleResponse(response);
};

// Get products by category
export const getProductsByCategory = async ({ 
  category,
  page = 1, 
  limit = 12,
  sort = 'newest'
}: { 
  category: string,
  page?: number, 
  limit?: number,
  sort?: string
}) => {
  // Build query string
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('sort', sort);
  
  const response = await fetch(`${API_URL}/products/category/${category}?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store'
  });
  
  return handleResponse(response);
};

// Get a single product by ID
export const getProductById = async (productId: string) => {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store'
  });
  
  return handleResponse(response);
};

// Get featured products
export const getFeaturedProducts = async () => {
  const response = await fetch(`${API_URL}/products/featured`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store'
  });
  
  return handleResponse(response);
};

// Cart related API calls
// -------------------------

// Get the current user's cart
export const getCart = async () => {
  const response = await fetch(`${API_URL}/cart`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
    cache: 'no-store'
  });
  
  return handleResponse(response);
};

// Add an item to the cart
export const addToCart = async (productData: { 
  productId: number | string; 
  quantity?: number;
}) => {
  const response = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
    body: JSON.stringify(productData),
  });
  
  return handleResponse(response);
};

// Update the quantity of an item in the cart
export const updateCartItem = async (cartItemId: number | string, quantity: number) => {
  const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
    body: JSON.stringify({ quantity }),
  });
  
  return handleResponse(response);
};

// Remove an item from the cart
export const removeFromCart = async (cartItemId: number | string) => {
  const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
};

// Clear the entire cart
export const clearCart = async () => {
  const response = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
};

// Order related API calls
// -------------------------

// Create a new order from the user's cart
export const createOrder = async () => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
};

// Get all orders for the current user
export const getUserOrders = async (page = 1, limit = 10) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const response = await fetch(`${API_URL}/orders?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
};

// Get a specific order by ID
export const getOrderById = async (orderId: number | string) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
};

// Cancel an order
export const cancelOrder = async (orderId: number | string) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
};

// Mark an order as fulfilled (delivered)
export const fulfillOrder = async (orderId: number | string) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/fulfill`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include', // Include cookies in the request
  });
  
  return handleResponse(response);
}; 