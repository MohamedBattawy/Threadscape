"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { deleteUserAccount, updateUserProfile } from '../../utils/api';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?returnTo=/account/profile');
    }
  }, [user, loading, router]);

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      // Prepare the data to update
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        country: formData.country
      };

      // Call the API to update the profile
      await updateUserProfile(updateData);
      
      // Display success message and exit edit mode
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
      
      // Add a small delay before refreshing to ensure the API has time to complete
      setTimeout(() => {
        window.location.reload(); // Force a complete page reload instead of just router.refresh()
      }, 500);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      await deleteUserAccount();
      
      // After successful deletion, log the user out
      await logout();
      
      // Redirect to home page with a message
      router.push('/?deleted=true');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-w-lg w-full">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Delete Account</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.
                    </p>
                  </div>
                  {error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={isDeleting}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : 'Delete'}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Profile Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Your personal details and settings
            </p>
          </div>
          
          {error && !showDeleteConfirm && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 mx-4 mt-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 p-4 mx-4 mt-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                      ${isEditing 
                        ? 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600' 
                        : 'border-transparent bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                      ${isEditing 
                        ? 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600' 
                        : 'border-transparent bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true} // Email is always disabled, can't be changed
                    className="mt-1 block w-full border-transparent bg-gray-100 dark:bg-gray-700/50 rounded-md shadow-sm text-gray-700 dark:text-gray-300 sm:text-sm"
                  />
                  {isEditing && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Email cannot be changed. Please contact support if you need to update your email.
                    </p>
                  )}
                </div>

                <div className="col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                      ${isEditing 
                        ? 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600' 
                        : 'border-transparent bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                      ${isEditing 
                        ? 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600' 
                        : 'border-transparent bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm 
                      ${isEditing 
                        ? 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600' 
                        : 'border-transparent bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form to original values
                        if (user) {
                          setFormData({
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            email: user.email || '',
                            address: user.address || '',
                            city: user.city || '',
                            country: user.country || ''
                          });
                        }
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                        ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}
                      `}
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setSuccessMessage('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Account Settings
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Manage your account security and preferences
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Change Password</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You can change your password to improve your account security.
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  onClick={() => router.push('/account/change-password')}
                >
                  Change Password
                </button>
              </div>
              
              <div className="pt-5 border-t dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Permanently delete your account and all associated data.
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}