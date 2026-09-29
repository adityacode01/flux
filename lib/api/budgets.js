import { api, toQuery } from "./client";

export const listBudgets = (month) => api.get(`/api/budgets${toQuery({ month })}`);
export const createBudget = (data) => api.post("/api/budgets", data);
export const updateBudget = (id, data) => api.patch(`/api/budgets/${id}`, data);
export const deleteBudget = (id) => api.delete(`/api/budgets/${id}`);
