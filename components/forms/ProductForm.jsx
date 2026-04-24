"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { productsApi } from "@/services/products";
import { titleize, unwrapEntityResponse, unwrapListResponse } from "@/services/normalizers";
import { ChevronDown } from "lucide-react";

const defaultForm = {
  name: "",
  imageUrl: "",
  categoryId: "",
  foodType: "veg",
  basePrice: "",
  description: "",
  status: "active",
};

export default function ProductForm({ productId = null, returnPage = null }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const categoryRef = useRef(null);

  useEffect(() => {
    if (!productId) return;

    const load = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, productResponse] = await Promise.all([
          categoriesApi.list({ status: "active" }),
          productId ? productsApi.get(productId) : Promise.resolve(null),
        ]);
        setCategories(unwrapListResponse(categoriesResponse));
        const product = unwrapEntityResponse(productResponse);
        setForm({
          name: product?.name || "",
          imageUrl: product?.image_url || product?.imageUrl || "",
          categoryId: String(product?.category_id ?? product?.categoryId ?? ""),
          foodType: product?.food_type || product?.foodType || "veg",
          basePrice: product?.base_price ?? product?.basePrice ?? "",
          description: product?.description || "",
          status: product?.status || "active",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [productId]);

  useEffect(() => {
    if (productId) return;

    categoriesApi.list({ status: "active" })
      .then((response) => setCategories(unwrapListResponse(response)))
      .catch(() => setCategories([]));
  }, [productId]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!categoryRef.current?.contains(event.target)) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => String(category.id) === String(form.categoryId),
      ) || null,
    [categories, form.categoryId],
  );

  const filteredCategories = useMemo(() => {
    const term = categoryQuery.trim().toLowerCase();
    const activeCategories = categories.filter(
      (category) => (category.status || "").toLowerCase() === "active",
    );

    const source = activeCategories.length ? activeCategories : categories;
    const sorted = [...source].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || "")),
    );

    if (!term) return sorted;

    return sorted.filter((category) => {
      const name = String(category.name || "").toLowerCase();
      const slug = String(category.slug || "").toLowerCase();
      return name.includes(term) || slug.includes(term);
    });
  }, [categories, categoryQuery]);

  const selectCategory = (category) => {
    setForm((current) => ({ ...current, categoryId: String(category.id) }));
    setCategoryQuery("");
    setCategoryOpen(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.categoryId || !form.foodType) {
      setError("Name, category, and food type are required.");
      return;
    }

    if (Number(form.basePrice) < 0) {
      setError("Base price must be zero or greater.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      imageUrl: form.imageUrl.trim() || null,
      categoryId: Number(form.categoryId),
      foodType: form.foodType,
      basePrice: Number(form.basePrice || 0),
      description: form.description.trim() || null,
      status: form.status,
    };

    try {
      setSaving(true);
      if (productId) {
        await productsApi.update(productId, payload);
      } else {
        await productsApi.create(payload);
      }
      const productsUrl =
        returnPage && Number(returnPage) > 1
          ? `/products?page=${returnPage}`
          : "/products";
      router.push(productsUrl);
      router.refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageIntro
        eyebrow=" "
        title={productId ? "Edit Product" : "New Product"}
        description=""
      />

      <Panel>
        {loading ? (
          <div className="py-10 text-sm uppercase tracking-[0.16rem] text-[#5d5e61]">Loading product</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Name" required>
                <TextInput value={form.name} onChange={onChange("name")} placeholder="Paneer Tikka" />
              </Field>
              {/* <Field label="Image URL">
                <TextInput value={form.imageUrl} onChange={onChange("imageUrl")} placeholder="https://..." />
              </Field> */}
              <Field label="Category" required>
                <div ref={categoryRef} className="relative">
                  <TextInput
                    value={categoryOpen ? categoryQuery : selectedCategory?.name || ""}
                    onChange={(event) => {
                      setCategoryQuery(event.target.value);
                      setCategoryOpen(true);
                    }}
                    onFocus={() => {
                      setCategoryQuery("");
                      setCategoryOpen(true);
                    }}
                    placeholder="Search category"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryQuery("");
                      setCategoryOpen((current) => !current);
                    }}
                    className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-[#7b6540]"
                    aria-label="Toggle category list"
                  >
                    <ChevronDown
                      size={18}
                      className={`transition ${categoryOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {categoryOpen ? (
                    <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-sm border border-[rgba(123,101,64,0.18)] bg-[#fffdf7] shadow-[0_18px_30px_rgba(47,51,49,0.08)]">
                      {filteredCategories.length ? (
                        filteredCategories.map((category) => {
                          const active =
                            String(category.id) === String(form.categoryId);

                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => selectCategory(category)}
                              className={`block w-full cursor-pointer px-4 py-3 text-left text-sm transition ${
                                active
                                  ? "bg-[#efe4ca] font-semibold text-[#6f5d33]"
                                  : "text-[#2f3331] hover:bg-[#f7f1e5]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <span>{category.name}</span>
                                <span className="text-[11px] uppercase tracking-[0.12rem] text-[#7d817d]">
                                  {titleize(category.status)}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-4 text-sm text-[#5f6662]">
                          No categories found.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </Field>
              <Field label="Food Type" required>
                <Select value={form.foodType} onChange={onChange("foodType")}>
                  <option value="veg">Veg</option>
                  <option value="non_veg">Non Veg</option>
                </Select>
              </Field>
              <Field label="Base Price" required>
                <TextInput value={form.basePrice} onChange={onChange("basePrice")} type="number" min="0" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </div>

            <Field label="Description">
              <TextArea value={form.description} onChange={onChange("description")} placeholder="Smoked paneer cubes" />
            </Field>

            <MessageBanner tone="danger" message={error} />

            <div className="flex gap-3">
              <PrimaryButton type="submit">{saving ? <LoadingInline label="Saving..." /> : "Save Product"}</PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={() =>
                  router.push(
                    returnPage && Number(returnPage) > 1
                      ? `/products?page=${returnPage}`
                      : "/products",
                  )
                }
              >
                Cancel
              </SecondaryButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}
