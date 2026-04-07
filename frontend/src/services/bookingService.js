import api from './api';

export const getAvailableSlots = (username, date, timezone) =>
  api.get(`/bookings/slots/${username}`, { params: { date, timezone } });

export const createBooking = (username, data) =>
  api.post(`/bookings/book/${username}`, data);

export const getMyBookings = (params = {}) =>
  api.get('/bookings/mine', { params });

export const cancelBooking = (id, cancelToken) => {
  const params = cancelToken ? { cancelToken } : {};
  return api.patch(`/bookings/${id}/cancel`, null, { params });
};
