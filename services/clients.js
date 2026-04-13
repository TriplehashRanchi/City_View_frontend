import { api } from "@/services/api";

export const clientsApi = {
  list(params = {}) {
    return api.get("/clients", { params }).then((response) => response.data);
  },
  get(id) {
    return api.get(`/clients/${id}`).then((response) => response.data);
  },
  create(payload) {
    return api.post("/clients", payload).then((response) => response.data);
  },
  update(id, payload) {
    return api.patch(`/clients/${id}`, payload).then((response) => response.data);
  },
};
