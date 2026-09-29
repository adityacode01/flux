import { api, toQuery } from "./client";

export const listTransactions = (query = {}) => api.get(`/api/transactions${toQuery(query)}`);
export const createTransaction = (data) => api.post("/api/transactions", data);
export const updateTransaction = (id, data) => api.patch(`/api/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}`);
