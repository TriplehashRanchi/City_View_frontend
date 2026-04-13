import { api } from "@/services/api";

export const packagesApi = {
  list(params = {}) {
    return api.get("/catalog/packages", { params }).then((response) => response.data);
  },
  get(id) {
    return api.get(`/catalog/packages/${id}`).then((response) => response.data);
  },
  create(payload) {
    return api.post("/catalog/packages", payload).then((response) => response.data);
  },
  update(id, payload) {
    return api.patch(`/catalog/packages/${id}`, payload).then((response) => response.data);
  },
};
