import { api } from "./client";

export const listRecurring = () => api.get("/api/recurring");
export const createRecurring = (data) => api.post("/api/recurring", data);
export const updateRecurring = (id, data) => api.patch(`/api/recurring/${id}`, data);
export const deleteRecurring = (id) => api.delete(`/api/recurring/${id}`);
