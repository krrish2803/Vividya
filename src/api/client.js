const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...options.headers,
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  let data = await res.json();

  if (!res.ok) {
    if (res.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.data?.accessToken || refreshData.accessToken;
            if (newToken) {
              localStorage.setItem('accessToken', newToken);
              headers['Authorization'] = `Bearer ${newToken}`;
              res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
              data = await res.json();
              if (res.ok) return data;
            }
          }
        } catch (refreshErr) {
          console.error('Silent token refresh failed:', refreshErr);
        }
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refresh: (refreshToken) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getProfile: () => request('/users/profile'),
  updateProfile: (profile) => request('/users/profile', { method: 'PUT', body: JSON.stringify({ profile }) }),
  moodCheck: (mood, note) => request('/users/mood-check', { method: 'POST', body: JSON.stringify({ mood, note }) }),
  getDashboardStats: () => request('/dashboard/stats'),
  getDailyGreeting: () => request('/dashboard/daily-greeting'),
  sendMessage: (body) => request('/chat/message', { method: 'POST', body: JSON.stringify(body) }),
  getChatHistory: (type) => request(`/chat/history?conversationType=${type}`),
  getNotes: (subject) => request(`/notes${subject ? `?subject=${subject}` : ''}`),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

  // Phase 2 - generic helpers
  get: (endpoint) => request(endpoint),
  post: (endpoint, body, opts) => {
    const isFormData = body instanceof FormData;
    return request(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      ...opts,
    });
  },
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
