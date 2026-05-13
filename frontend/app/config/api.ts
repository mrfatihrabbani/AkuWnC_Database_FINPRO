import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const authAPI = {
  login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  register: (username: string, email: string, password: string) => 
    api.post('/api/auth/register', { username, email, password }),
};

export const movieAPI = {
  getAll: () => api.get('/api/content/browse'),
  getTopRated: () => api.get('/api/content/top-rated'),
  search: (query: string) => api.get(`/api/content/search?q=${query}`),
  getByTitles: (titles: string[]) => api.post('/api/content/by-titles', { titles }),
  getGenreStats: () => api.get('/api/content/stats/genres'),
};

export const userAPI = {
  getProfile: (username: string) => api.get(`/api/users/${username}/profile`),
  updateProfile: (username: string, data: { bio?: string; gender?: string; favoriteGenres?: string[] }) =>
    api.put(`/api/users/${username}/profile`, data),
  getReviews: (username: string) => api.get(`/api/users/${username}/reviews`),
  getPopular: () => api.get('/api/users/popular'),
  getRecentReviews: () => api.get('/api/reviews/recent'),
  uploadAvatar: (username: string, formData: FormData) =>
    api.post(`/api/users/${username}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const graphAPI = {
  getFollowing: (username: string) => api.get(`/api/graph/following/${username}`),
  getFollowers: (username: string) => api.get(`/api/graph/followers/${username}`),
  follow: (from: string, to: string) => api.post('/api/graph/follow', { from, to }),
  unfollow: (from: string, to: string) => api.post('/api/graph/unfollow', { from, to }),
  getRecommendations: (username: string) => api.get(`/api/graph/recommendations/${username}`),
  getFriendActivity: (username: string) => api.get(`/api/graph/friend-activity/${username}`),
  getSimilarMovies: (movieTitle: string) => api.get(`/api/graph/similar/${movieTitle}`),
  rateMovie: (username: string, movieTitle: string, score: number) => 
    api.post('/api/graph/rate', { username, movieTitle, score }),
};

export const contentAPI = {
  search: (q: string, type?: string) => api.get(`/api/content/search`, { params: { q, type } }),
  browse: (params: { type?: string; genre?: string; sortBy?: string; page?: number; perPage?: number }) =>
    api.get('/api/content/browse', { params }),
  getById: (id: string) => api.get(`/api/content/${id}`),
  getTopRated: (type = 'movie', limit = 10) => api.get('/api/content/top-rated', { params: { type, limit } }),
  getGenreStats: (type = 'movie') => api.get('/api/content/stats/genres', { params: { type } }),
  getByGenre: (genre: string, type = 'movie') => api.get(`/api/content/genre/${genre}`, { params: { type } }),
  getByYear: (year: number) => api.get(`/api/content/year/${year}`),
  getSimilar: (id: string) => api.get(`/api/content/similar/${id}`),
  getRecommendations: (username: string) => api.get('/api/content/recommendations', { params: { username } }),
  rate: (data: { contentId: string; score: number; title: string; type: string; username: string }) =>
    api.post('/api/content/rate', data),
};

export const appInfoAPI = {
  getDetails: () => api.get('/api/app-info'),
};

export const reviewAPI = {
  getPopular: (limit = 5) => api.get(`/api/reviews/popular?limit=${limit}`),
  getForContent: (contentId: string) => api.get(`/api/reviews/content/${contentId}`),
  getForUser: (username: string) => api.get(`/api/reviews/user/${username}`),
  create: (data: { username: string; contentId: string; rating: number; content: string; isFirstWatch?: boolean; containsSpoilers?: boolean }) =>
    api.post('/api/reviews', data),
  toggleLike: (reviewId: string, username: string) =>
    api.post(`/api/reviews/${reviewId}/like`, { username }),
};

export const watchlistAPI = {
  get: (username: string) => api.get(`/api/watchlist/${username}`),
  status: (username: string, contentId: string) => api.get('/api/watchlist/status', { params: { username, contentId } }),
  add: (username: string, contentId: string, status: 'watched' | 'want_to_watch') =>
    api.post('/api/watchlist/add', { username, contentId, status }),
  remove: (username: string, contentId: string) =>
    api.post('/api/watchlist/remove', { username, contentId }),
};

export const notificationAPI = {
  getForUser: (username: string) => api.get(`/api/notifications/${username}`),
  clearAll: (username: string) => api.delete(`/api/notifications/${username}/clear`),
};

export default api;