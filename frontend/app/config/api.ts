import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const authAPI = {
  login: (username: string, password: string) => api.post('/api/auth/login', { username, password }),
  register: (username: string, email: string, password: string) => 
    api.post('/api/auth/register', { username, email, password }),
};

export const movieAPI = {
  getAll: () => api.get('/api/movies'),
  getTopRated: () => api.get('/api/movies/top'),
  search: (query: string) => api.get(`/api/movies/search?q=${query}`),
  getByTitles: (titles: string[]) => api.post('/api/movies/by-titles', { titles }),
  getGenreStats: () => api.get('/api/movies/genre-stats'),
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

export default api;