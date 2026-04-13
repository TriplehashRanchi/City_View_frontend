import { api } from "@/services/api";

export const categoriesApi = {
  list(params = {}) {
    return api.get("/catalog/categories", { params }).then((response) => response.data);
  },
  get(id) {
    return api.get(`/catalog/categories/${id}`).then((response) => response.data);
  },
  create(payload) {
    return api.post("/catalog/categories", payload).then((response) => response.data);
  },
  update(id, payload) {
    return api.patch(`/catalog/categories/${id}`, payload).then((response) => response.data);
  },
};
