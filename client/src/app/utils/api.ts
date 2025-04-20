// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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