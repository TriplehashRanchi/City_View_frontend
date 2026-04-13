import { api } from "@/services/api";

export const productsApi = {
  list(params = {}) {
    return api.get("/catalog/products", { params }).then((response) => response.data);
  },
  get(id) {
    return api.get(`/catalog/products/${id}`).then((response) => response.data);
  },
  create(payload) {
    return api.post("/catalog/products", payload).then((response) => response.data);
  },
  update(id, payload) {
    return api.patch(`/catalog/products/${id}`, payload).then((response) => response.data);
  },
};
