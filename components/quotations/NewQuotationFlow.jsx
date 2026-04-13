"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, LoadingInline, LoadingState, MessageBanner, PageIntro, Panel, PrimaryButton, SecondaryButton, Select, TextArea, TextInput } from "@/components/AdminUI";
import { categoriesApi } from "@/services/categories";
import { clientsApi } from "@/services/clients";
import { eventsApi } from "@/services/events";
import { packagesApi } from "@/services/packages";
import { productsApi } from "@/services/products";
import { quotationsApi } from "@/services/quotations";
import { formatCurrency, titleize, toNumber, unwrapEntityResponse, unwrapListResponse } from "@/services/normalizers";

const steps = [{ id: 1, label: "Client" }, { id: 2, label: "Event" }, { id: 3, label: "Items" }, { id: 4, label: "Pricing" }];
const emptyClient = { name: "", phone: "", email: "", companyName: "", notes: "", status: "active" };
const emptyEvent = { occasionType: "", eventDate: "", startTime: "", endTime: "", guestCount: 1, venue: "", notes: "", eventStatus: "enquiry" };
const emptyVersion = { sourcePackageId: "", selectedProductIds: [], excludedProductIds: [], customItems: [], perPersonPrice: "", guestCount: 1, discountType: "none", discountValue: 0, validUntil: "", notes: "", termsAndConditions: "" };

const unchangedPayload = (s) => ({ validUntil: s.validUntil || null, termsAndConditions: s.termsAndConditions.trim() || null, notes: s.notes.trim() || null, sourcePackageId: Number(s.sourcePackageId), productIds: [], excludedProductIds: [], customItems: [], perPersonPrice: toNumber(s.perPersonPrice), guestCount: Math.max(toNumber(s.guestCount, 1), 1), discountType: s.discountType, discountValue: toNumber(s.discountValue) });
const changedPayload = (s) => ({ validUntil: s.validUntil || null, termsAndConditions: s.termsAndConditions.trim() || null, notes: s.notes.trim() || null, sourcePackageId: s.sourcePackageId ? Number(s.sourcePackageId) : null, productIds: s.selectedProductIds.map(Number), excludedProductIds: s.excludedProductIds.map(Number), customItems: s.customItems.filter((i) => i.name.trim()).map((i) => ({ name: i.name.trim(), description: i.description.trim() || null })), perPersonPrice: toNumber(s.perPersonPrice), guestCount: Math.max(toNumber(s.guestCount, 1), 1), discountType: s.discountType, discountValue: toNumber(s.discountValue) });

function StepRail({ step, setStep }) {
  return <div className="editorial-panel p-4"><div className="grid gap-2 md:grid-cols-4">{steps.map((item) => <button key={item.id} type="button" onClick={() => setStep(item.id)} className={`px-4 py-4 text-left ${step === item.id ? "bg-[#2f3331] text-[#faf9f7]" : step > item.id ? "bg-[#e8dec7] text-[#493c22]" : "bg-[#f3f4f1] text-[#5f6662]"}`}><p className="text-[11px] font-semibold uppercase tracking-[0.18rem]">Step {item.id}</p><p className="display-font mt-2 text-2xl">{item.label}</p></button>)}</div></div>;
}

export default function NewQuotationFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackageDetail, setSelectedPackageDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsCache, setProductsCache] = useState({});
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [useNewClient, setUseNewClient] = useState(false);
  const [client, setClient] = useState(emptyClient);
  const [event, setEvent] = useState(emptyEvent);
  const [version, setVersion] = useState(emptyVersion);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([clientsApi.list({ limit: 200 }), categoriesApi.list({ status: "active" }), packagesApi.list({ status: "active" })])
      .then(([a, b, c]) => {
        setClients(unwrapListResponse(a));
        setCategories(unwrapListResponse(b));
        setPackages(unwrapListResponse(c));
      })
      .catch((err) => setError(err?.response?.data?.message || "Unable to load quotation creation flow."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    productsApi.list({
      status: "active",
      limit: 1000,
      categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
      foodType: foodTypeFilter !== "all" ? foodTypeFilter : undefined,
      search: productSearch.trim() || undefined,
    })
      .then((res) => {
        const list = unwrapListResponse(res);
        setProducts(list);
        setProductsCache((prev) => {
          const next = { ...prev };
          list.forEach((p) => { next[String(p.id)] = p; });
          return next;
        });
      })
      .catch((err) => setError(err?.response?.data?.message || "Unable to load products."));
  }, [productSearch, categoryFilter, foodTypeFilter]);

  const selectedClient = useMemo(() => clients.find((c) => String(c.id) === String(selectedClientId)), [clients, selectedClientId]);
  const filteredClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase();
    return clients.filter((c) => !term || c.name?.toLowerCase().includes(term) || c.phone?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term) || c.company_name?.toLowerCase().includes(term));
  }, [clientSearch, clients]);
  const selectedPackage = useMemo(() => packages.find((p) => String(p.id) === String(version.sourcePackageId)), [packages, version.sourcePackageId]);
  const packageProductIds = useMemo(() => !selectedPackageDetail ? [] : (selectedPackageDetail.products || []).map((i) => String(i.product_id ?? i.productId ?? i.id)), [selectedPackageDetail]);
  const includedProductIds = useMemo(() => {
    const manual = new Set(version.selectedProductIds.map(String));
    const excluded = new Set(version.excludedProductIds.map(String));
    return Array.from(new Set([...packageProductIds.filter((id) => !excluded.has(id)), ...manual]));
  }, [packageProductIds, version.selectedProductIds, version.excludedProductIds]);
  const selectedProducts = useMemo(() => includedProductIds.map((id) => productsCache[String(id)]).filter(Boolean), [includedProductIds, productsCache]);
  const groupedSelected = useMemo(() => selectedProducts.reduce((acc, p) => { const key = p.category_name || p.category_slug || "Uncategorized"; if (!acc[key]) acc[key] = []; acc[key].push(p); return acc; }, {}), [selectedProducts]);
  const subtotal = useMemo(() => toNumber(version.perPersonPrice) * Math.max(toNumber(version.guestCount, 1), 1), [version.perPersonPrice, version.guestCount]);
  const discountAmount = useMemo(() => version.discountType === "flat" ? Math.min(toNumber(version.discountValue), subtotal) : version.discountType === "percentage" ? Math.min((subtotal * toNumber(version.discountValue)) / 100, subtotal) : 0, [version.discountType, version.discountValue, subtotal]);
  const estimatedFinal = Math.max(subtotal - discountAmount, 0);

  const suggestedPrice = useMemo(() => {
    if (!selectedProducts.length) return null;
    const total = selectedProducts.reduce((sum, p) => sum + Number(p.base_price || 0), 0);
    return Math.round(total / 3.75);
  }, [selectedProducts]);

  const setClientField = (k) => (e) => setClient((s) => ({ ...s, [k]: e.target.value }));
  const setEventField = (k) => (e) => { const v = e.target.value; setEvent((s) => ({ ...s, [k]: v })); if (k === "guestCount") setVersion((s) => ({ ...s, guestCount: v })); };
  const setVersionField = (k) => (e) => setVersion((s) => ({ ...s, [k]: e.target.value }));
  const applyPackage = async (id) => { const pkg = packages.find((p) => String(p.id) === String(id)); setVersion((s) => ({ ...s, sourcePackageId: String(id), selectedProductIds: [], excludedProductIds: [], customItems: [], perPersonPrice: pkg?.per_person_price ?? pkg?.perPersonPrice ?? s.perPersonPrice })); if (id) { try { const detail = await packagesApi.get(id); setSelectedPackageDetail(unwrapEntityResponse(detail)); } catch { setSelectedPackageDetail(null); } } else { setSelectedPackageDetail(null); } };
  const addProduct = (productId) => { const id = String(productId); const fromPackage = packageProductIds.includes(id); setVersion((s) => ({ ...s, excludedProductIds: fromPackage ? s.excludedProductIds.filter((x) => String(x) !== id) : s.excludedProductIds, selectedProductIds: fromPackage || s.selectedProductIds.some((x) => String(x) === id) ? s.selectedProductIds : [...s.selectedProductIds, productId] })); };
  const removeProduct = (productId) => { const id = String(productId); const fromPackage = packageProductIds.includes(id); setVersion((s) => ({ ...s, selectedProductIds: s.selectedProductIds.filter((x) => String(x) !== id), excludedProductIds: fromPackage && !s.excludedProductIds.some((x) => String(x) === id) ? [...s.excludedProductIds, productId] : s.excludedProductIds })); };
  const addCustom = () => setVersion((s) => ({ ...s, customItems: [...s.customItems, { name: "", description: "" }] }));
  const updateCustom = (i, k, v) => setVersion((s) => ({ ...s, customItems: s.customItems.map((item, idx) => idx === i ? { ...item, [k]: v } : item) }));
  const removeCustom = (i) => setVersion((s) => ({ ...s, customItems: s.customItems.filter((_, idx) => idx !== i) }));

  const validate = (target = step) => {
    if (target === 1) return !useNewClient && !selectedClientId ? "Select an existing client or create a new one." : useNewClient && !client.name.trim() ? "New client name is required." : "";
    if (target === 2) return !event.occasionType.trim() || !event.eventDate || toNumber(event.guestCount, 0) < 1 ? "Event occasion, date, and guest count are required." : "";
    if (target === 3) return !selectedProducts.length && !version.customItems.filter((i) => i.name.trim()).length ? "Add at least one catalog item or one custom item." : "";
    if (target === 4) return toNumber(version.perPersonPrice) < 0 || toNumber(version.discountValue) < 0 ? "Quotation pricing values must be valid." : version.customItems.some((i) => !i.name.trim() && i.description.trim()) ? "Custom item name is required." : "";
    return "";
  };

  const next = () => { const message = validate(step); if (message) return setError(message); setError(""); setStep((s) => Math.min(s + 1, 4)); };
  const prev = () => { setError(""); setStep((s) => Math.max(s - 1, 1)); };

  const submit = async () => {
    const message = validate(4);
    if (message) return setError(message);
    try {
      setSaving(true);
      setError("");
      let clientId = Number(selectedClientId);
      if (useNewClient) {
        const createdClient = await clientsApi.create({ name: client.name.trim(), phone: client.phone.trim() || null, email: client.email.trim() || null, companyName: client.companyName.trim() || null, notes: client.notes.trim() || null, status: client.status });
        clientId = unwrapEntityResponse(createdClient)?.id;
      }
      const createdEvent = await eventsApi.create({ clientId, occasionType: event.occasionType.trim(), eventDate: event.eventDate, startTime: event.startTime || null, endTime: event.endTime || null, guestCount: toNumber(event.guestCount, 1), venue: event.venue.trim() || null, notes: event.notes.trim() || null, eventStatus: event.eventStatus });
      const eventEntity = unwrapEntityResponse(createdEvent);
      const initialized = await quotationsApi.initQuotation({ eventId: Number(eventEntity.id) });
      const quotationEntity = unwrapEntityResponse(initialized);
      const unchanged = Boolean(version.sourcePackageId) && !version.selectedProductIds.length && !version.excludedProductIds.length && !version.customItems.filter((i) => i.name.trim()).length;
      const createdVersion = await quotationsApi.createQuotationVersion(quotationEntity.id, unchanged ? unchangedPayload(version) : changedPayload(version));
      router.push(`/quotation-versions/${unwrapEntityResponse(createdVersion)?.id}`);
      router.refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create client, event, and quotation together.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading quotation creation..." />;

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      <PageIntro eyebrow=" " title="New Quotation" description="Step through client, event, items, and pricing. The item workspace gets the most room because it is the main operator task." />
      <StepRail step={step} setStep={setStep} />
      <MessageBanner tone="danger" message={error} />
      {step === 1 ? <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]"><Panel title="Client Selection" subtitle="Search and select an existing client, or switch to a new client inline."><div className="space-y-6"><div className="flex gap-3"><SecondaryButton type="button" onClick={() => setUseNewClient(false)} className={!useNewClient ? "opacity-100" : "opacity-70"}>Existing Client</SecondaryButton><SecondaryButton type="button" onClick={() => setUseNewClient(true)} className={useNewClient ? "opacity-100" : "opacity-70"}>New Client</SecondaryButton></div>{!useNewClient ? <div className="space-y-4"><Field label="Search Client"><TextInput value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Search name, phone, email, company" /></Field><div className="editorial-muted max-h-[520px] overflow-y-auto p-3"><div className="space-y-2">{filteredClients.length ? filteredClients.map((c) => <button key={c.id} type="button" onClick={() => setSelectedClientId(String(c.id))} className={`w-full p-4 text-left transition ${String(selectedClientId) === String(c.id) ? "editorial-panel" : "bg-[#faf9f7] hover:bg-[#ffffff]"}`}><p className="font-semibold text-[#2f3331]">{c.name}</p><p className="mt-1 text-sm text-[#5f6662]">{[c.phone, c.email, c.company_name].filter(Boolean).join(" / ") || "No extra details"}</p></button>) : <div className="px-4 py-10 text-center text-sm text-[#5f6662]">No matching clients.</div>}</div></div></div> : <div className="grid gap-4"><Field label="Client Name" required><TextInput value={client.name} onChange={setClientField("name")} /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Phone"><TextInput value={client.phone} onChange={setClientField("phone")} /></Field><Field label="Email"><TextInput value={client.email} onChange={setClientField("email")} /></Field></div><Field label="Company Name"><TextInput value={client.companyName} onChange={setClientField("companyName")} /></Field><Field label="Client Notes"><TextArea value={client.notes} onChange={setClientField("notes")} /></Field></div>}</div></Panel><Panel title="Current Selection" subtitle="Quick confirmation before moving on."><div className="space-y-4 text-sm leading-7 text-[#2f3331]">{!useNewClient && selectedClient ? <><p><span className="text-[#5d5e61]">Name:</span> {selectedClient.name}</p><p><span className="text-[#5d5e61]">Phone:</span> {selectedClient.phone || "-"}</p><p><span className="text-[#5d5e61]">Email:</span> {selectedClient.email || "-"}</p><p><span className="text-[#5d5e61]">Company:</span> {selectedClient.company_name || "-"}</p></> : useNewClient ? <><p><span className="text-[#5d5e61]">Name:</span> {client.name || "-"}</p><p><span className="text-[#5d5e61]">Phone:</span> {client.phone || "-"}</p><p><span className="text-[#5d5e61]">Email:</span> {client.email || "-"}</p><p><span className="text-[#5d5e61]">Company:</span> {client.companyName || "-"}</p></> : <p className="text-[#5f6662]">No client selected yet.</p>}</div></Panel></div> : null}
      {step === 2 ? <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]"><Panel title="Event Details" subtitle="Capture the event record that will own the quotation thread."><div className="grid gap-4 md:grid-cols-2"><Field label="Occasion Type" required><TextInput value={event.occasionType} onChange={setEventField("occasionType")} placeholder="Wedding" /></Field><Field label="Guest Count" required><TextInput type="number" min="1" value={event.guestCount} onChange={setEventField("guestCount")} /></Field><Field label="Event Date" required><TextInput type="date" value={event.eventDate} onChange={setEventField("eventDate")} /></Field><Field label="Status"><Select value={event.eventStatus} onChange={setEventField("eventStatus")}><option value="enquiry">Enquiry</option><option value="quotation_created">Quotation Created</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></Select></Field><Field label="Start Time"><TextInput type="time" value={event.startTime} onChange={setEventField("startTime")} /></Field><Field label="End Time"><TextInput type="time" value={event.endTime} onChange={setEventField("endTime")} /></Field></div><div className="mt-4 grid gap-4"><Field label="Venue"><TextInput value={event.venue} onChange={setEventField("venue")} placeholder="City View Banquet" /></Field><Field label="Event Notes"><TextArea value={event.notes} onChange={setEventField("notes")} /></Field></div></Panel><Panel title="Event Preview" subtitle="This summary carries into the quotation."><div className="space-y-4 text-sm leading-7 text-[#2f3331]"><p><span className="text-[#5d5e61]">Client:</span> {useNewClient ? client.name || "-" : selectedClient?.name || "-"}</p><p><span className="text-[#5d5e61]">Occasion:</span> {event.occasionType || "-"}</p><p><span className="text-[#5d5e61]">Date:</span> {event.eventDate || "-"}</p><p><span className="text-[#5d5e61]">Guests:</span> {event.guestCount || "-"}</p><p><span className="text-[#5d5e61]">Venue:</span> {event.venue || "-"}</p></div></Panel></div> : null}
      {step === 3 ? <div className="grid gap-8 xl:grid-cols-[1.15fr_1fr]"><Panel title="Catalog" subtitle="This is the main workspace. Filter, import a package if useful, then curate the selected list."><div className="space-y-6"><div className="grid gap-4 md:grid-cols-2"><Field label="Import Package"><Select value={version.sourcePackageId} onChange={(e) => applyPackage(e.target.value)}><option value="">No package</option>{packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field><Field label="Search Products"><TextInput value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products" /></Field></div><div className="grid gap-4 md:grid-cols-2"><Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="all">All Categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select><Select value={foodTypeFilter} onChange={(e) => setFoodTypeFilter(e.target.value)}><option value="all">All Food Types</option><option value="veg">Veg</option><option value="non_veg">Non Veg</option></Select></div><div className="editorial-muted max-h-[640px] overflow-y-auto p-3"><div className="space-y-2">{products.map((p) => { const included = includedProductIds.includes(String(p.id)); return <div key={p.id} className="editorial-panel grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-start"><div className="space-y-1"><p className="font-semibold text-[#2f3331]">{p.name}</p><p className="text-xs uppercase tracking-[0.12rem] text-[#5d5e61]">{p.category_name || titleize(p.category_slug)} / {titleize(p.food_type)}</p></div><button type="button" onClick={() => (included ? removeProduct(p.id) : addProduct(p.id))} className={`${included ? "bg-[#f6e8e5] text-[#8b3733]" : "editorial-button"} px-3 py-2 text-xs uppercase tracking-[0.12rem]`}>{included ? "Remove" : "Include"}</button></div>; })}</div></div></div></Panel><div className="space-y-8"><Panel title="Selected Items" subtitle="Grouped by category for a cleaner quotation draft."><div className="space-y-4">{version.sourcePackageId ? <div className="editorial-muted px-4 py-3 text-sm text-[#5f6662]">Source package: <span className="font-semibold text-[#2f3331]">{selectedPackage?.name || "Selected package"}</span>{Boolean(version.sourcePackageId) && !version.selectedProductIds.length && !version.excludedProductIds.length && !version.customItems.filter((i) => i.name.trim()).length ? " / unchanged import" : " / modified import"}</div> : null}{selectedProducts.length ? Object.entries(groupedSelected).map(([groupName, items]) => <div key={groupName} className="space-y-2"><div className="px-1 pt-2"><p className="text-[11px] font-semibold uppercase tracking-[0.16rem] text-[#7b6540]">{groupName}</p></div>{items.map((p) => <div key={p.id} className="editorial-muted grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-start"><div className="space-y-1"><p className="font-semibold text-[#2f3331]">{p.name}</p><p className="text-xs uppercase tracking-[0.12rem] text-[#5d5e61]">{packageProductIds.includes(String(p.id)) ? "Imported from package" : "Added manually"} / {titleize(p.food_type)}</p></div><button type="button" onClick={() => removeProduct(p.id)} className="bg-[#f6e8e5] px-3 py-2 text-xs uppercase tracking-[0.12rem] text-[#8b3733]">Remove</button></div>)}</div>) : <div className="editorial-muted px-4 py-10 text-center text-sm leading-7 text-[#5f6662]">No products selected yet.</div>}</div></Panel><Panel title="Custom Items" subtitle="Only use these for additions outside the product catalog."><div className="space-y-4">{version.customItems.map((item, i) => <div key={`${i}-${item.name}`} className="editorial-muted p-4"><div className="grid gap-4"><Field label="Item Name" required><TextInput value={item.name} onChange={(e) => updateCustom(i, "name", e.target.value)} /></Field><Field label="Description"><TextArea value={item.description} onChange={(e) => updateCustom(i, "description", e.target.value)} /></Field><div><button type="button" onClick={() => removeCustom(i)} className="bg-[#f6e8e5] px-3 py-2 text-xs uppercase tracking-[0.12rem] text-[#8b3733]">Remove Custom Item</button></div></div></div>)}<SecondaryButton type="button" onClick={addCustom}>Add Custom Item</SecondaryButton></div></Panel></div></div> : null}
      {step === 4 ? <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]"><Panel title="Pricing And Terms" subtitle="Final quotation controls before save."><div className="grid gap-4 md:grid-cols-2"><Field label="Per Person Price"><TextInput type="number" min="0" value={version.perPersonPrice} onChange={setVersionField("perPersonPrice")} />{suggestedPrice !== null && (<div className="mt-2 flex items-center gap-3"><span className="text-xs text-[#5d5e61]">Suggested: <strong className="text-[#2f3331]">₹{suggestedPrice.toLocaleString("en-IN")}</strong></span><button type="button" onClick={() => setVersion((s) => ({ ...s, perPersonPrice: String(suggestedPrice) }))} className="text-xs underline text-[#5d5e61] hover:text-[#2f3331]">Apply</button></div>)}</Field><Field label="Guest Count"><TextInput type="number" min="1" value={version.guestCount} onChange={setVersionField("guestCount")} /></Field><Field label="Discount Type"><Select value={version.discountType} onChange={setVersionField("discountType")}><option value="none">None</option><option value="flat">Flat</option><option value="percentage">Percentage</option></Select></Field><Field label="Discount Value"><TextInput type="number" min="0" value={version.discountValue} onChange={setVersionField("discountValue")} /></Field><Field label="Valid Until"><TextInput type="date" value={version.validUntil} onChange={setVersionField("validUntil")} /></Field></div><div className="mt-4 grid gap-4"><Field label="Notes"><TextArea value={version.notes} onChange={setVersionField("notes")} /></Field><Field label="Terms And Conditions"><TextArea value={version.termsAndConditions} onChange={setVersionField("termsAndConditions")} /></Field></div></Panel><Panel title="Review" subtitle="Last operator check before save."><div className="space-y-6"><div className="editorial-muted p-4 text-sm leading-7 text-[#2f3331]"><p><span className="text-[#5d5e61]">Client:</span> {useNewClient ? client.name || "-" : selectedClient?.name || "-"}</p><p><span className="text-[#5d5e61]">Occasion:</span> {event.occasionType || "-"}</p><p><span className="text-[#5d5e61]">Guests:</span> {version.guestCount || "-"}</p><p><span className="text-[#5d5e61]">Package:</span> {selectedPackage?.name || "No package"}</p><p><span className="text-[#5d5e61]">Catalog Items:</span> {selectedProducts.length}</p><p><span className="text-[#5d5e61]">Custom Items:</span> {version.customItems.filter((i) => i.name.trim()).length}</p></div><div className="editorial-muted p-4 text-sm leading-7 text-[#2f3331]"><div className="flex items-center justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="mt-2 flex items-center justify-between"><span>Discount</span><span>{formatCurrency(discountAmount)}</span></div><div className="mt-4 flex items-center justify-between text-base font-semibold"><span>Estimated Final</span><span>{formatCurrency(estimatedFinal)}</span></div></div><PrimaryButton type="button" onClick={submit}>{saving ? <LoadingInline label="Creating..." /> : "Create Full Quotation"}</PrimaryButton></div></Panel></div> : null}
      <div className="flex items-center justify-between gap-4"><SecondaryButton type="button" onClick={prev} disabled={step === 1}>Previous Step</SecondaryButton>{step < 4 ? <PrimaryButton type="button" onClick={next}>Next Step</PrimaryButton> : null}</div>
    </div>
  );
}
