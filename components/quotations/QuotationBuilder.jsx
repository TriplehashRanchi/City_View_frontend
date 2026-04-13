"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  LoadingInline,
  LoadingState,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { categoriesApi } from "@/services/categories";
import { eventsApi } from "@/services/events";
import { packagesApi } from "@/services/packages";
import { productsApi } from "@/services/products";
import { quotationsApi } from "@/services/quotations";
import { formatCurrency, formatDate, titleize, toNumber, unwrapEntityResponse, unwrapListResponse } from "@/services/normalizers";

const defaultState = {
  sourcePackageId: "",
  selectedProductIds: [],
  excludedProductIds: [],
  customItems: [],
  perPersonPrice: "",
  guestCount: 1,
  discountType: "none",
  discountValue: 0,
  validUntil: "",
  notes: "",
  termsAndConditions: "",
};

function buildUnchangedPackagePayload(state) {
  return {
    validUntil: state.validUntil || null,
    termsAndConditions: state.termsAndConditions.trim() || null,
    notes: state.notes.trim() || null,
    sourcePackageId: Number(state.sourcePackageId),
    productIds: [],
    excludedProductIds: [],
    customItems: [],
    perPersonPrice: toNumber(state.perPersonPrice),
    guestCount: Math.max(toNumber(state.guestCount, 1), 1),
    discountType: state.discountType,
    discountValue: toNumber(state.discountValue),
  };
}

function buildChangedPayload(state) {
  return {
    validUntil: state.validUntil || null,
    termsAndConditions: state.termsAndConditions.trim() || null,
    notes: state.notes.trim() || null,
    sourcePackageId: state.sourcePackageId ? Number(state.sourcePackageId) : null,
    productIds: state.selectedProductIds.map(Number),
    excludedProductIds: state.excludedProductIds.map(Number),
    customItems: state.customItems
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name.trim(),
        description: item.description.trim() || null,
      })),
    perPersonPrice: toNumber(state.perPersonPrice),
    guestCount: Math.max(toNumber(state.guestCount, 1), 1),
    discountType: state.discountType,
    discountValue: toNumber(state.discountValue),
  };
}

export default function QuotationBuilder({ eventId }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackageDetail, setSelectedPackageDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsCache, setProductsCache] = useState({});
  const [categories, setCategories] = useState([]);
  const [state, setState] = useState(defaultState);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [eventResponse, categoriesResponse, packagesResponse, productsResponse, quotationListResponse] = await Promise.all([
          eventsApi.get(eventId),
          categoriesApi.list({ status: "active" }),
          packagesApi.list({ status: "active" }),
          // productsApi.list({ status: "active" }),
          quotationsApi.listQuotationsByEvent(eventId).catch(() => null),
        ]);

        const eventEntity = unwrapEntityResponse(eventResponse);
        const packageList = unwrapListResponse(packagesResponse);
        // const productList = unwrapListResponse(productsResponse);
        const quotationList = unwrapListResponse(quotationListResponse);

        setEvent(eventEntity);
        setCategories(unwrapListResponse(categoriesResponse));
        setPackages(packageList);
        // setProducts(productList);

        if (quotationList.length) {
          const quotationDetail = await quotationsApi.getQuotation(quotationList[0].id);
          setQuotation(unwrapEntityResponse(quotationDetail));
        }

        setState((current) => ({
          ...current,
          guestCount: eventEntity?.guest_count ?? eventEntity?.guestCount ?? 1,
        }));
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load quotation workspace.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  useEffect(() => {
  const loadProducts = async () => {
    try {
      const productsResponse = await productsApi.list({
        status: "active",
        page: 1,
        limit: 1000,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        foodType: foodTypeFilter !== "all" ? foodTypeFilter : undefined,
        search: search.trim() || undefined,
      });

      const list = unwrapListResponse(productsResponse);
      setProducts(list);
      setProductsCache((prev) => {
        const next = { ...prev };
        list.forEach((p) => { next[String(p.id)] = p; });
        return next;
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load products.");
    }
  };

  loadProducts();
}, [search, categoryFilter, foodTypeFilter]);

  const selectedPackage = useMemo(
    () => packages.find((item) => String(item.id) === String(state.sourcePackageId)),
    [packages, state.sourcePackageId]
  );

  const packageProductIds = useMemo(() => {
    if (!selectedPackageDetail) return [];
    return (selectedPackageDetail.products || []).map((item) => String(item.product_id ?? item.productId ?? item.id));
  }, [selectedPackageDetail]);

  const includedProductIds = useMemo(() => {
    const manual = new Set(state.selectedProductIds.map(String));
    const excluded = new Set(state.excludedProductIds.map(String));
    const fromPackage = packageProductIds.filter((id) => !excluded.has(id));
    return Array.from(new Set([...fromPackage, ...manual]));
  }, [packageProductIds, state.excludedProductIds, state.selectedProductIds]);

  const selectedProducts = useMemo(() => {
    return includedProductIds
      .map((id) => productsCache[String(id)])
      .filter(Boolean);
  }, [includedProductIds, productsCache]);

  const groupedSelectedProducts = useMemo(() => {
    return selectedProducts.reduce((accumulator, product) => {
      const key = product.category_name || product.category_slug || "Uncategorized";
      if (!accumulator[key]) accumulator[key] = [];
      accumulator[key].push(product);
      return accumulator;
    }, {});
  }, [selectedProducts]);

  const packageUnchanged = useMemo(() => {
    return Boolean(state.sourcePackageId) && state.selectedProductIds.length === 0 && state.excludedProductIds.length === 0 && state.customItems.filter((item) => item.name.trim()).length === 0;
  }, [state]);

  const suggestedPrice = useMemo(() => {
    if (!selectedProducts.length) return null;
    const total = selectedProducts.reduce((sum, p) => sum + Number(p.base_price || 0), 0);
    return Math.round(total / 3.75);
  }, [selectedProducts]);

  const subtotal = useMemo(() => toNumber(state.perPersonPrice) * Math.max(toNumber(state.guestCount, 1), 1), [state.guestCount, state.perPersonPrice]);
  const discountAmount = useMemo(() => {
    if (state.discountType === "flat") return Math.min(toNumber(state.discountValue), subtotal);
    if (state.discountType === "percentage") return Math.min((subtotal * toNumber(state.discountValue)) / 100, subtotal);
    return 0;
  }, [state.discountType, state.discountValue, subtotal]);
  const estimatedFinal = Math.max(subtotal - discountAmount, 0);

  const applyPackage = async (packageId) => {
    const pkg = packages.find((item) => String(item.id) === String(packageId));
    setState((current) => ({
      ...current,
      sourcePackageId: String(packageId),
      selectedProductIds: [],
      excludedProductIds: [],
      customItems: [],
      perPersonPrice: pkg?.per_person_price ?? pkg?.perPersonPrice ?? current.perPersonPrice,
    }));
    if (packageId) {
      try {
        const detail = await packagesApi.get(packageId);
        const pkgDetail = unwrapEntityResponse(detail);
        setSelectedPackageDetail(pkgDetail);
        const pkgProducts = (pkgDetail?.products || []).map((item) => item.product).filter(Boolean);
        if (pkgProducts.length) {
          setProductsCache((prev) => {
            const next = { ...prev };
            pkgProducts.forEach((p) => { next[String(p.id)] = p; });
            return next;
          });
        }
      } catch {
        setSelectedPackageDetail(null);
      }
    } else {
      setSelectedPackageDetail(null);
    }
  };

  const addProduct = (productId) => {
    const id = String(productId);
    const fromPackage = packageProductIds.includes(id);
    setState((current) => ({
      ...current,
      excludedProductIds: fromPackage ? current.excludedProductIds.filter((item) => String(item) !== id) : current.excludedProductIds,
      selectedProductIds: fromPackage || current.selectedProductIds.some((item) => String(item) === id)
        ? current.selectedProductIds
        : [...current.selectedProductIds, productId],
    }));
  };

  const removeProduct = (productId) => {
    const id = String(productId);
    const fromPackage = packageProductIds.includes(id);
    setState((current) => ({
      ...current,
      selectedProductIds: current.selectedProductIds.filter((item) => String(item) !== id),
      excludedProductIds: fromPackage && !current.excludedProductIds.some((item) => String(item) === id)
        ? [...current.excludedProductIds, productId]
        : current.excludedProductIds,
    }));
  };

  const addCustomItem = () => {
    setState((current) => ({
      ...current,
      customItems: [...current.customItems, { name: "", description: "" }],
    }));
  };

  const updateCustomItem = (index, key, value) => {
    setState((current) => ({
      ...current,
      customItems: current.customItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const removeCustomItem = (index) => {
    setState((current) => ({
      ...current,
      customItems: current.customItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const onChange = (key) => (event) => {
    setState((current) => ({ ...current, [key]: event.target.value }));
  };

  const saveVersion = async () => {
    setError("");

    if (toNumber(state.perPersonPrice) < 0 || toNumber(state.guestCount, 1) < 1 || toNumber(state.discountValue) < 0) {
      setError("Per person price, guest count, and discount must be valid non-negative values.");
      return;
    }

    if (state.customItems.some((item) => !item.name.trim() && item.description.trim())) {
      setError("Custom item name is required.");
      return;
    }

    try {
      setSaving(true);

      let quotationId = quotation?.id;
      if (!quotationId) {
        const initialized = await quotationsApi.initQuotation({ eventId: Number(eventId) });
        const quotationEntity = unwrapEntityResponse(initialized);
        quotationId = quotationEntity?.id;
      }

      const payload = packageUnchanged ? buildUnchangedPackagePayload(state) : buildChangedPayload(state);
      const versionResponse = await quotationsApi.createQuotationVersion(quotationId, payload);
      const versionEntity = unwrapEntityResponse(versionResponse);
      router.push(`/quotation-versions/${versionEntity?.id}`);
      router.refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save quotation version.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading quotation workspace..." />;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <PageIntro
        eyebrow=" "
        title="Build Quotation Version"
        description="Use one flat selected-item list. Packages only prefill items; the backend decides whether the final version still renders as a package."
      />

      <MessageBanner tone="danger" message={error} />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1.05fr_1.05fr]">
        <div className="space-y-4">
          <Panel title="Event Summary" subtitle="Client and event context for this quotation.">
            <div className="grid gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14rem] text-[#5d5e61]">Client</p>
                <p className="mt-1 text-lg text-[#2f3331]">{event?.client_name || event?.client?.name || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14rem] text-[#5d5e61]">Occasion</p>
                <p className="mt-1 text-lg text-[#2f3331]">{event?.occasion_type || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14rem] text-[#5d5e61]">Date</p>
                <p className="mt-1 text-lg text-[#2f3331]">{formatDate(event?.event_date)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14rem] text-[#5d5e61]">Venue</p>
                <p className="mt-1 text-lg text-[#2f3331]">{event?.venue || "-"}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Catalog" subtitle="Import a package or manually add products.">
            <div className="space-y-6">
              <Field label="Import Package">
                <Select value={state.sourcePackageId} onChange={(event) => applyPackage(event.target.value)}>
                  <option value="">No package</option>
                  {packages.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Find Products">
                <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
              </Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                <Select value={foodTypeFilter} onChange={(event) => setFoodTypeFilter(event.target.value)}>
                  <option value="all">All Food Types</option>
                  <option value="veg">Veg</option>
                  <option value="non_veg">Non Veg</option>
                </Select>
              </div>

              <div className="editorial-muted max-h-[520px] overflow-y-auto p-3 hide-scrollbar">
                <div className="space-y-2">
                  {products.map((product) => {
                    const included = includedProductIds.includes(String(product.id));
                    return (
                      <div key={product.id} className="editorial-panel grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-start">
                        <div className="space-y-1">
                          <p className="font-semibold text-[#2f3331]">{product.name}</p>
                          <p className="text-xs uppercase tracking-[0.12rem] text-[#5d5e61]">
                            {product.category_name || titleize(product.category_slug)} / {titleize(product.food_type)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => (included ? removeProduct(product.id) : addProduct(product.id))}
                          className={`${included ? "bg-[#f6e8e5] text-[#8b3733]" : "editorial-button-secondary"} px-3 py-2 text-xs uppercase tracking-[0.12rem]`}
                        >
                          {included ? "Remove" : "Include"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Selected Items" subtitle="One flat item list. No package block, no line pricing.">
            <div className="space-y-4">
              {state.sourcePackageId ? (
                <div className="editorial-muted px-4 py-3 text-sm text-[#5f6662]">
                  Source package: <span className="font-semibold text-[#2f3331]">{selectedPackage?.name || "Selected package"}</span>
                  {packageUnchanged ? " / unchanged import" : " / modified import"}
                </div>
              ) : null}

              <div className="space-y-2">
                {selectedProducts.length ? (
                  Object.entries(groupedSelectedProducts).map(([groupName, items]) => (
                    <div key={groupName} className="space-y-2">
                      <div className="px-1 pt-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16rem] text-[#7b6540]">{groupName}</p>
                      </div>
                      {items.map((product) => {
                        const fromPackage = packageProductIds.includes(String(product.id));
                        return (
                          <div key={product.id} className="editorial-panel grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-start">
                            <div className="space-y-1">
                              <p className="font-semibold text-[#2f3331]">{product.name}</p>
                              <p className="text-xs uppercase tracking-[0.12rem] text-[#5d5e61]">
                                {fromPackage ? "Imported from package" : "Added manually"} / {titleize(product.food_type)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              className="bg-[#f6e8e5] px-3 py-2 text-xs uppercase tracking-[0.12rem] text-[#8b3733]"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="editorial-muted px-4 py-10 text-center text-sm leading-7 text-[#5f6662]">
                    No products selected yet.
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Custom Items" subtitle="Custom entries are flat and name-only required.">
            <div className="space-y-4">
              {state.customItems.map((item, index) => (
                <div key={`${index}-${item.name}`} className="editorial-muted p-4">
                  <div className="grid gap-4">
                    <Field label="Item Name" required>
                      <TextInput value={item.name} onChange={(event) => updateCustomItem(index, "name", event.target.value)} />
                    </Field>
                    <Field label="Description">
                      <TextArea value={item.description} onChange={(event) => updateCustomItem(index, "description", event.target.value)} />
                    </Field>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeCustomItem(index)}
                        className="bg-[#f6e8e5] px-3 py-2 text-xs uppercase tracking-[0.12rem] text-[#8b3733]"
                      >
                        Remove Custom Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <SecondaryButton type="button" onClick={addCustomItem}>
                Add Custom Item
              </SecondaryButton>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Pricing" subtitle="Preview only. Backend remains source of truth.">
            <div className="space-y-5">
              <Field label="Per Person Price">
                <TextInput type="number" min="0" value={state.perPersonPrice} onChange={onChange("perPersonPrice")} />
                {suggestedPrice !== null && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-[#5d5e61]">Suggested: <strong className="text-[#2f3331]">₹{suggestedPrice.toLocaleString("en-IN")}</strong></span>
                    <button type="button" onClick={() => setState((s) => ({ ...s, perPersonPrice: String(suggestedPrice) }))} className="text-xs underline text-[#5d5e61] hover:text-[#2f3331]">Apply</button>
                  </div>
                )}
              </Field>
              <Field label="Guest Count">
                <TextInput type="number" min="1" value={state.guestCount} onChange={onChange("guestCount")} />
              </Field>
              <Field label="Discount Type">
                <Select value={state.discountType} onChange={onChange("discountType")}>
                  <option value="none">None</option>
                  <option value="flat">Flat</option>
                  <option value="percentage">Percentage</option>
                </Select>
              </Field>
              <Field label="Discount Value">
                <TextInput type="number" min="0" value={state.discountValue} onChange={onChange("discountValue")} />
              </Field>

              <div className="editorial-muted p-4 text-sm leading-7 text-[#2f3331]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Discount</span>
                  <span>{formatCurrency(discountAmount)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-base font-semibold">
                  <span>Estimated Final</span>
                  <span>{formatCurrency(estimatedFinal)}</span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Version Metadata" subtitle="Save one version against the event quotation.">
            <div className="space-y-5">
              <Field label="Valid Until">
                <TextInput type="date" value={state.validUntil} onChange={onChange("validUntil")} />
              </Field>
              <Field label="Notes">
                <TextArea value={state.notes} onChange={onChange("notes")} placeholder="Best price for this event." />
              </Field>
              <Field label="Terms and Conditions">
                <TextArea value={state.termsAndConditions} onChange={onChange("termsAndConditions")} placeholder="50% advance required." />
              </Field>
              <PrimaryButton type="button" onClick={saveVersion}>
                {saving ? <LoadingInline label="Saving Version..." /> : "Save Version"}
              </PrimaryButton>
              {quotation?.id ? (
                <SecondaryButton type="button" onClick={() => router.push(`/quotations/${quotation.id}`)}>
                  Open Quotation
                </SecondaryButton>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
