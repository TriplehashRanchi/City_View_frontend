"use client";

import { api } from "@/services/api";

export const clientsApi = {
  async list(params = {}) {
    const { data } = await api.get("/clients", { params });
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/clients", payload);
    return data;
  },
};

export const catalogApi = {
  async listProducts(params = {}) {
    const { data } = await api.get("/catalog/products", { params });
    return data;
  },
  async createProduct(payload) {
    const { data } = await api.post("/catalog/products", payload);
    return data;
  },
  async listServices(params = {}) {
    const { data } = await api.get("/catalog/services", { params });
    return data;
  },
  async createService(payload) {
    const { data } = await api.post("/catalog/services", payload);
    return data;
  },
  async listPackages(params = {}) {
    const { data } = await api.get("/catalog/packages", { params });
    return data;
  },
  async createPackage(payload) {
    const { data } = await api.post("/catalog/packages", payload);
    return data;
  },
};

export const eventsApi = {
  async list(params = {}) {
    const { data } = await api.get("/operations/events", { params });
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/operations/events", payload);
    return data;
  },
};

export const quotationsApi = {
  async init(payload) {
    const { data } = await api.post("/quotations/init", payload);
    return data;
  },
  async listByEvent(eventId) {
    const { data } = await api.get(`/quotations/event/${eventId}`);
    return data;
  },
  async getById(id) {
    const { data } = await api.get(`/quotations/${id}`);
    return data;
  },
  async getVersionById(versionId) {
    const { data } = await api.get(`/quotations/versions/${versionId}`);
    return data;
  },
  async createVersion(quotationId, payload) {
    const { data } = await api.post(`/quotations/${quotationId}/versions`, payload);
    return data;
  },
  async updateVersionStatus(versionId, payload) {
    const { data } = await api.patch(`/quotations/versions/${versionId}/status`, payload);
    return data;
  },
};

export const searchApi = {
  async global(query, limit = 5) {
    const { data } = await api.get("/search", {
      params: {
        q: query,
        limit,
      },
    });
    return data;
  },
};

export const reportsApi = {
  async dashboard() {
    const { data } = await api.get("/reports/dashboard");
    return data;
  },
};
