"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  LoadingInline,
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
import { packagesApi } from "@/services/packages";
import { productsApi } from "@/services/products";
import { titleize, unwrapEntityResponse, unwrapListResponse } from "@/services/normalizers";

const defaultForm = {
  name: "",
  description: "",
  perPersonPrice: "",
  status: "active",
  products: [],
};

export default function PackageForm({ packageId = null }) {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [products, setProducts] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
        const [categoriesResponse, productsResponse, packageResponse] = await Promise.all([
          categoriesApi.list({ status: "active" }),
          productsApi.list({ status: "active", limit: 1000 }),
          packageId ? packagesApi.get(packageId) : Promise.resolve(null),
        ]);

        const productList = unwrapListResponse(productsResponse);
        setCategories(unwrapListResponse(categoriesResponse));
        setProducts(productList);
        setCatalogProducts(productList);

        if (packageResponse) {
          const pkg = unwrapEntityResponse(packageResponse);
          const selectedProducts = (pkg?.products || []).map((item, index) => ({
            productId: item.product_id ?? item.productId ?? item.id,
            sortOrder: item.sort_order ?? item.sortOrder ?? index + 1,
          }));

          setForm({
            name: pkg?.name || "",
            description: pkg?.description || "",
            perPersonPrice: pkg?.per_person_price ?? pkg?.perPersonPrice ?? "",
            status: pkg?.status || "active",
            products: selectedProducts,
          });
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load package form.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [packageId]);

  useEffect(() => {
    productsApi.list({
      status: "active",
      limit: 1000,
      categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
      foodType: foodTypeFilter !== "all" ? foodTypeFilter : undefined,
      search: search.trim() || undefined,
    })
      .then((res) => setCatalogProducts(unwrapListResponse(res)))
      .catch(() => {});
  }, [search, categoryFilter, foodTypeFilter]);

  const selectedProductIds = useMemo(() => new Set(form.products.map((item) => String(item.productId))), [form.products]);

  const suggestedPrice = useMemo(() => {
    const selected = form.products
      .map((item) => products.find((p) => String(p.id) === String(item.productId)))
      .filter(Boolean);
    if (!selected.length) return null;
    const total = selected.reduce((sum, p) => sum + Number(p.base_price || 0), 0);
    return Math.round(total / 3.75);
  }, [form.products, products]);

  const groupedSelectedProducts = useMemo(() => {
    const mapped = form.products
      .map((item) => {
        const product = products.find((entry) => String(entry.id) === String(item.productId));
        return product ? { item, product } : null;
      })
      .filter(Boolean);

    return mapped.reduce((accumulator, entry) => {
      const key = entry.product.category_name || entry.product.category_slug || "Uncategorized";
      if (!accumulator[key]) accumulator[key] = [];
      accumulator[key].push(entry);
      return accumulator;
    }, {});
  }, [form.products, products]);

  const addProduct = (productId) => {
    if (selectedProductIds.has(String(productId))) return;
    setForm((current) => ({
      ...current,
      products: [...current.products, { productId, sortOrder: current.products.length + 1 }],
    }));
  };

  const removeProduct = (productId) => {
    setForm((current) => ({
      ...current,
      products: current.products
        .filter((item) => String(item.productId) !== String(productId))
        .map((item, index) => ({ ...item, sortOrder: index + 1 })),
    }));
  };

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Package name is required.");
      return;
    }

    if (Number(form.perPersonPrice) < 0) {
      setError("Per person price must be zero or greater.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      perPersonPrice: Number(form.perPersonPrice || 0),
      status: form.status,
      products: form.products.map((item, index) => ({
        productId: Number(item.productId),
        sortOrder: index + 1,
      })),
    };

    try {
      setSaving(true);
      if (packageId) {
        await packagesApi.update(packageId, payload);
      } else {
        await packagesApi.create(payload);
      }
      router.push("/packages");
      router.refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save package.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageIntro
        eyebrow=" "
        title={packageId ? "Edit Package" : "New Package"}
        description=" "
      />

      <Panel>
        {loading ? (
          <div className="py-10 text-sm uppercase tracking-[0.16rem] text-[#5d5e61]">Loading package</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Name" required>
                <TextInput value={form.name} onChange={onChange("name")} placeholder="Silver Package" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </div>

            <Field label="Description">
              <TextArea value={form.description} onChange={onChange("description")} placeholder="Starter + main + dessert" />
            </Field>

            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <section className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16rem] text-[#5d5e61]">Product Catalog</p>
                  <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
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
                </div>
                <div className="editorial-muted max-h-[480px] overflow-y-auto p-3 hide-scrollbar">
                  <div className="space-y-2">
                    {catalogProducts.map((product) => (
                      <div key={product.id} className="editorial-panel flex items-start justify-between gap-4 p-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-[#2f3331]">{product.name}</p>
                          <p className="text-xs uppercase tracking-[0.12rem] text-[#5d5e61]">
                            {product.category_name || titleize(product.category_slug)} / {titleize(product.food_type)}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={selectedProductIds.has(String(product.id))}
                          onClick={() => addProduct(product.id)}
                          className="editorial-button-secondary px-3 py-2 text-xs uppercase tracking-[0.12rem] disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16rem] text-[#5d5e61]">Selected Products</p>
                <div className="editorial-muted min-h-[480px] p-3">
                  <div className="space-y-2">
                    {form.products.length ? (
                      Object.entries(groupedSelectedProducts).map(([groupName, entries]) => (
                        <div key={groupName} className="space-y-2">
                          <div className="px-1 pt-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16rem] text-[#7b6540]">{groupName}</p>
                          </div>
                          {entries.map(({ item, product }) => {
                            const index = form.products.findIndex((entry) => String(entry.productId) === String(item.productId));
                            return (
                              <div key={item.productId} className="editorial-panel grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-start">
                                <div className="space-y-1">
                                  <p className="font-semibold text-[#2f3331]">{product?.name || `Product #${item.productId}`}</p>
                                  <p className="text-xs uppercase tracking-[0.12rem] text-[#5d5e61]">
                                    Selected {index + 1} / {titleize(product?.food_type)}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => removeProduct(item.productId)} className="bg-[#f6e8e5] px-3 py-2 text-xs uppercase tracking-[0.12rem] text-[#8b3733]">
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-12 text-center text-sm leading-7 text-[#5f6662]">
                        Add products from the left. The order here becomes the stored `sortOrder`.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <Field label="Per Person Price" required>
              <TextInput value={form.perPersonPrice} onChange={onChange("perPersonPrice")} type="number" min="0" />
              {suggestedPrice !== null && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-[#5d5e61]">Suggested: <strong className="text-[#2f3331]">₹{suggestedPrice.toLocaleString("en-IN")}</strong></span>
                  <button type="button" onClick={() => setForm((s) => ({ ...s, perPersonPrice: String(suggestedPrice) }))} className="text-xs underline text-[#5d5e61] hover:text-[#2f3331]">Apply</button>
                </div>
              )}
            </Field>

            <MessageBanner tone="danger" message={error} />

            <div className="flex gap-3">
              <PrimaryButton type="submit">{saving ? <LoadingInline label="Saving..." /> : "Save Package"}</PrimaryButton>
              <SecondaryButton type="button" onClick={() => router.push("/packages")}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}
