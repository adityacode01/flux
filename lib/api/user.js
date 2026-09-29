import { api } from "./client";

export const updateProfile = (data) => api.patch("/api/me", data);
