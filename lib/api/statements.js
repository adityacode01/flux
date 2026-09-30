import { api, toQuery } from "./client";

export const getStatement = (range) => api.get(`/api/statements${toQuery({ range })}`);