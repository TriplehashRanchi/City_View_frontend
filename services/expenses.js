import { api } from "@/services/api";

export const expensesApi = {
  list(params = {}) {
    return api.get("/expenses", { params }).then((response) => response.data);
  },
  summary(params = {}) {
    return api.get("/expenses/summary", { params }).then((response) => response.data);
  },
  get(id) {
    return api.get(`/expenses/${id}`).then((response) => response.data);
  },
  create(payload) {
    return api.post("/expenses", payload).then((response) => response.data);
  },
  update(id, payload) {
    return api.patch(`/expenses/${id}`, payload).then((response) => response.data);
  },
  remove(id) {
    return api.delete(`/expenses/${id}`).then((response) => response.data);
  },
};
