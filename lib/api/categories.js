import { api } from "./client";

export const listCategories = () => api.get("/api/categories");
export const createCategory = (data) => api.post("/api/categories", data);
export const updateCategory = (id, data) => api.patch(`/api/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);
