import { api } from "@/services/api";

export const eventsApi = {
  list(params = {}) {
    return api.get("/operations/events", { params }).then((response) => response.data);
  },
  get(id) {
    return api.get(`/operations/events/${id}`).then((response) => response.data);
  },
  create(payload) {
    return api.post("/operations/events", payload).then((response) => response.data);
  },
  update(id, payload) {
    return api.patch(`/operations/events/${id}`, payload).then((response) => response.data);
  },
};
