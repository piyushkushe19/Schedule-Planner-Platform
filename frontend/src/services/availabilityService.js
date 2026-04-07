import api from './api';

export const getMyAvailability    = ()           => api.get('/availability/me');
export const updateAvailability   = (data)       => api.put('/availability/me', data);
export const getPublicAvailability = (username)  => api.get(`/availability/public/${username}`);
