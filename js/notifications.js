import { API_BASE_URL } from './config.js';

export async function getUnreadNotifications() {
  const token = localStorage.getItem('token');
  if (!token) return 0;

  const response = await fetch(`${API_BASE_URL}/auth/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  return data.unreadNotifications || 0;
}
