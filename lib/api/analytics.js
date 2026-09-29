import { api, toQuery } from "./client";

export const getAnalytics = (query = {}) => api.get(`/api/analytics${toQuery(query)}`);
