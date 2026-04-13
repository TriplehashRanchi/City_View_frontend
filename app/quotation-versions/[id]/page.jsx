"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MessageBanner, PageIntro, Panel, PrimaryButton, SecondaryButton, Select } from "@/components/AdminUI";
import { quotationsApi } from "@/services/quotations";
import { formatCurrency, formatDate, titleize, unwrapEntityResponse, unwrapListResponse } from "@/services/normalizers";

export default function QuotationVersionDetailPage() {
  const params = useParams();
  const [version, setVersion] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const accepted = useMemo(() => status === "accepted" || version?.status === "accepted", [status, version?.status]);
  const groupedItems = useMemo(() => {
    const items = unwrapListResponse(version?.items || version?.line_items || []);
    return items.reduce((accumulator, item) => {
      const key = item.item_category || "Uncategorized";
      if (!accumulator[key]) accumulator[key] = [];
      accumulator[key].push(item);
      return accumulator;
    }, {});
  }, [version]);

  useEffect(() => {
    const load = async () => {
      try {
        const [versionResponse, pdfResponse] = await Promise.all([
          quotationsApi.getQuotationVersion(params.id),
          quotationsApi.getQuotationPdfData(params.id).catch(() => null),
        ]);
        const versionEntity = unwrapEntityResponse(versionResponse);
        setVersion(versionEntity);
        setStatus(versionEntity?.status || "draft");
        setPdfData(unwrapEntityResponse(pdfResponse));
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load quotation version.");
      }
    };
    load();
  }, [params.id]);

  const updateStatus = async () => {
    try {
      setSaving(true);
      await quotationsApi.updateQuotationVersionStatus(params.id, { status });
      const versionResponse = await quotationsApi.getQuotationVersion(params.id);
      setVersion(unwrapEntityResponse(versionResponse));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update version status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow=" "
        title={`${version?.quote_code || "Quotation"} / V${version?.version_number || "-"}`}
        description="Version detail, item list, pricing summary, and PDF-facing data."
      />

      <MessageBanner tone="danger" message={error} />

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <Panel title="Summary">
            <div className="grid gap-4 text-sm leading-7 text-[#2f3331]">
              <p><span className="text-[#5d5e61]">Status:</span> {titleize(version?.status)}</p>
              <p><span className="text-[#5d5e61]">Client:</span> {version?.client_name || version?.client_snapshot?.name || "-"}</p>
              <p><span className="text-[#5d5e61]">Event:</span> {version?.occasion_type || version?.event_snapshot?.occasion_type || "-"}</p>
              <p><span className="text-[#5d5e61]">Valid Until:</span> {formatDate(version?.valid_until)}</p>
              <p><span className="text-[#5d5e61]">Display As Package:</span> {version?.display_as_package ? "Yes" : "No"}</p>
              <p><span className="text-[#5d5e61]">Source Package:</span> {version?.source_package?.name || "-"}</p>
            </div>
          </Panel>

          <Panel title="Status Actions">
            <div className="space-y-4">
              <Select value={status} onChange={(event) => setStatus(event.target.value)} disabled={accepted}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </Select>
              <PrimaryButton type="button" onClick={updateStatus} disabled={saving || accepted}>
                {saving ? "Saving..." : accepted ? "Accepted" : "Update Status"}
              </PrimaryButton>
              {version?.quotation_id ? (
                <SecondaryButton type="button" onClick={() => window.location.assign(`/quotations/${version.quotation_id}`)}>
                  Open Quotation
                </SecondaryButton>
              ) : null}
            </div>
            
          </Panel>
          <Panel title="Price Summary">
            <div className="editorial-muted p-4 text-sm leading-7 text-[#2f3331]">
              <div className="flex items-center justify-between"><span>Per Person</span><span>{formatCurrency(version?.per_person_price)}</span></div>
              <div className="mt-2 flex items-center justify-between"><span>Guest Count</span><span>{version?.guest_count || 0}</span></div>
              <div className="mt-2 flex items-center justify-between"><span>Subtotal</span><span>{formatCurrency(version?.subtotal_amount)}</span></div>
              <div className="mt-2 flex items-center justify-between"><span>Discount</span><span>{formatCurrency(version?.discount_amount || version?.discount_value)}</span></div>
              <div className="mt-4 flex items-center justify-between font-semibold"><span>Final Amount</span><span>{formatCurrency(version?.final_amount)}</span></div>
            </div>
          </Panel>
        </div>

        <div className="space-y-8">
          <Panel title="Items">
            <div className="grid gap-3">
              {Object.keys(groupedItems).length ? Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="space-y-2">
                  <div className="px-1 pt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16rem] text-[#7b6540]">{groupName}</p>
                  </div>
                  {items.map((item) => (
                    <div key={item.id || `${item.item_name}-${item.sort_order}`} className="editorial-muted p-4">
                      <p className="font-semibold text-[#2f3331]">{item.item_name}</p>
                      <p className="text-sm text-[#5f6662]">
                        {titleize(item.item_type || item.catalog_type || "item")} {item.food_type ? `/ ${titleize(item.food_type)}` : ""}
                      </p>
                      {item.description ? <p className="mt-2 text-sm leading-7 text-[#5f6662]">{item.description}</p> : null}
                    </div>
                  ))}
                </div>
              )) : <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662]">No items found on this version.</div>}
            </div>
          </Panel>

          

       
        </div>
        
      </div>
    </div>
  );
}
