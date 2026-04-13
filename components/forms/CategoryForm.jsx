"use client";

import { useEffect, useState } from "react";
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
  TextInput,
} from "@/components/AdminUI";
import { categoriesApi } from "@/services/categories";
import { unwrapEntityResponse } from "@/services/normalizers";

const defaultForm = {
  name: "",
  slug: "",
  status: "active",
  sortOrder: 1,
};

export default function CategoryForm({ categoryId = null }) {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(Boolean(categoryId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!categoryId) return;

    categoriesApi.get(categoryId)
      .then((response) => {
        const category = unwrapEntityResponse(response);
        setForm({
          name: category?.name || "",
          slug: category?.slug || "",
          status: category?.status || "active",
          sortOrder: category?.sort_order ?? category?.sortOrder ?? 1,
        });
      })
      .catch((err) => setError(err?.response?.data?.message || "Unable to load category."))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.slug.trim()) {
      setError("Category name and slug are required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      status: form.status,
      sortOrder: Number(form.sortOrder || 1),
    };

    try {
      setSaving(true);
      if (categoryId) {
        await categoriesApi.update(categoryId, payload);
      } else {
        await categoriesApi.create(payload);
      }
      router.push("/categories");
      router.refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageIntro
        eyebrow=" "
        title={categoryId ? "Edit Category" : "New Category"}
        description="Categories are first-class records. Products reference them by `categoryId`."
      />

      <Panel>
        {loading ? (
          <div className="py-10 text-sm uppercase tracking-[0.16rem] text-[#5d5e61]">Loading category</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Name" required>
                <TextInput value={form.name} onChange={onChange("name")} placeholder="Starter" />
              </Field>
              <Field label="Slug" required>
                <TextInput value={form.slug} onChange={onChange("slug")} placeholder="starter" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
              <Field label="Sort Order">
                <TextInput type="number" min="1" value={form.sortOrder} onChange={onChange("sortOrder")} />
              </Field>
            </div>

            <MessageBanner tone="danger" message={error} />

            <div className="flex gap-3">
              <PrimaryButton type="submit">{saving ? <LoadingInline label="Saving..." /> : "Save Category"}</PrimaryButton>
              <SecondaryButton type="button" onClick={() => router.push("/categories")}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}
