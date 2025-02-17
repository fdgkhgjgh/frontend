import { API_BASE_URL } from './config.js';

export async function getUnreadNotifications() {
  const token = localStorage.getItem('token');
  if (!token) return { count: 0, notifications: [] };

  const response = await fetch(`${API_BASE_URL}/auth/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  return {
      count: data.unreadNotifications,
      notifications: data.notifications || []
  };
}