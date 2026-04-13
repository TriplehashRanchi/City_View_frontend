import { api } from "@/services/api";

export const quotationsApi = {
  initQuotation(payload) {
    return api.post("/quotations/init", payload).then((response) => response.data);
  },
  getQuotation(id) {
    return api.get(`/quotations/${id}`).then((response) => response.data);
  },
  listQuotationsByEvent(eventId) {
    return api.get(`/quotations/event/${eventId}`).then((response) => response.data);
  },
  createQuotationVersion(quotationId, payload) {
    return api.post(`/quotations/${quotationId}/versions`, payload).then((response) => response.data);
  },
  cloneQuotationVersion(versionId) {
    return api.post(`/quotations/versions/${versionId}/clone`).then((response) => response.data);
  },
  getQuotationVersion(versionId) {
    return api.get(`/quotations/versions/${versionId}`).then((response) => response.data);
  },
  updateQuotationVersionStatus(versionId, payload) {
    return api.patch(`/quotations/versions/${versionId}/status`, payload).then((response) => response.data);
  },
  getQuotationPdfData(versionId) {
    return api.get(`/quotations/versions/${versionId}/pdf-data`).then((response) => response.data);
  },
};
