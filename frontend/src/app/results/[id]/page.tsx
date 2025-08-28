"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@shadcn/ui/badge";
import { Skeleton } from "@shadcn/ui/skeleton";
import { Button } from "@shadcn/ui/button";
import { Download, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { buildCalendlyUrl } from "../../../utils/buildCalendlyUrl";

function fetchEstimate(id: string) {
  return fetch(`http://localhost:8000/estimate/${id}`).then(res => {
    if (!res.ok) throw new Error("Not found");
    return res.json();
  });
}

const confidenceMap = {
  high: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-4 h-4 mr-1" /> },
  medium: { color: "bg-yellow-100 text-yellow-700", icon: <AlertTriangle className="w-4 h-4 mr-1" /> },
  low: { color: "bg-red-100 text-red-700", icon: <AlertTriangle className="w-4 h-4 mr-1" /> },
};

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["estimate", id],
    queryFn: () => fetchEstimate(id),
    retry: false,
  });

  const comps = data?.comps || [];
  const min = data?.range_low;
  const max = data?.range_high;
  const median = data?.point_estimate;
  const conf = data?.confidence;
  const addressStr = comps[0]?.address || "property";

  // For range bar
  const pct = useMemo(() => {
    if (!min || !max || !median) return 50;
    return Math.min(100, Math.max(0, ((median - min) / (max - min)) * 100));
  }, [min, max, median]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
      <div className="lg:col-span-8 w-full flex flex-col gap-8 min-w-0">
        {/* Hero stats */}
        <section className="flex flex-col md:flex-row gap-6 items-center md:items-end">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Estimated Range</div>
            {isLoading ? (
              <Skeleton className="w-48 h-12 mb-2" />
            ) : isError ? (
              <div className="text-red-500 flex items-center gap-2" aria-live="assertive">
                Estimate not found.
                <Button variant="outline" size="sm" onClick={() => refetch()} aria-label="Retry">
                  <RefreshCw className="w-4 h-4 mr-1" /> Retry
                </Button>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-neutral-900">${min?.toLocaleString()} – ${max?.toLocaleString()}</span>
              </div>
            )}
            <div className="text-neutral-500 mt-1">Median: <span className="font-semibold text-neutral-800">${median?.toLocaleString()}</span></div>
          </div>
          <div className="flex items-center gap-2 ml-0 md:ml-8 mt-4 md:mt-0">
            {conf && (
              <Badge className={confidenceMap[conf]?.color + " flex items-center px-3 py-1 text-sm font-medium"}>
                {confidenceMap[conf]?.icon}
                {conf.charAt(0).toUpperCase() + conf.slice(1)} Confidence
              </Badge>
            )}
          </div>
        </section>
        {/* Price Insights Card */}
        <section className="bg-white/90 rounded-2xl shadow-soft p-6 border border-neutral-100 hover:shadow-lift transition-shadow" aria-label="Price Insights">
          <h3 className="font-heading text-lg font-bold mb-2">Price Insights</h3>
          {isLoading ? (
            <Skeleton className="w-full h-8 mb-4" />
          ) : isError ? (
            <div className="text-red-500">No insights available.</div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="relative w-full h-6 mt-2 mb-2">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-blue-200 via-violet-300 to-blue-100" />
                <div
                  className="absolute top-0 h-6 flex items-center"
                  style={{ left: `calc(${pct}% - 16px)` }}
                >
                  <div className="w-8 h-8 rounded-full bg-accent-500 border-4 border-white shadow-soft flex items-center justify-center text-white font-bold text-lg" style={{ boxShadow: "0 2px 8px 0 rgba(80,80,180,0.10)" }}>
                    ▲
                  </div>
                </div>
                <div className="absolute left-0 -top-6 text-xs text-neutral-500">${min?.toLocaleString()}</div>
                <div className="absolute right-0 -top-6 text-xs text-neutral-500">${max?.toLocaleString()}</div>
              </div>
              <div className="text-neutral-600 text-sm mt-2">We adjust for size, condition, and recency to give you a fair market estimate. The pointer shows the median value among comparable properties.</div>
            </div>
          )}
        </section>
        {/* Top Comps Card */}
        <section className="bg-white/90 rounded-2xl shadow-soft p-6 border border-neutral-100 hover:shadow-lift transition-shadow" aria-label="Top Comparables">
          <h3 className="font-heading text-lg font-bold mb-2">Top Comps</h3>
          {isLoading ? (
            <Skeleton className="w-full h-32" />
          ) : isError ? (
            <div className="text-neutral-500">No comparable properties found.</div>
          ) : !comps.length ? (
            <div className="text-neutral-400">No comps available for this estimate.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border-separate border-spacing-y-1" aria-label="Comparables table">
                <thead className="sticky top-0 bg-white/95 z-10">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold">Address</th>
                    <th className="px-2 py-2 text-left">Dist (km)</th>
                    <th className="px-2 py-2 text-left">Beds</th>
                    <th className="px-2 py-2 text-left">Baths</th>
                    <th className="px-2 py-2 text-left">Sqft</th>
                    <th className="px-2 py-2 text-left">Adj. Price</th>
                    <th className="px-2 py-2 text-left">Days Ago</th>
                  </tr>
                </thead>
                <tbody>
                  {comps.map((c: any, i: number) => (
                    <tr key={c.id} className={i % 2 ? "bg-neutral-50" : ""}>
                      <td className="truncate max-w-[120px]" title={c.address}>{c.address}</td>
                      <td>{c.distance_km.toFixed(2)}</td>
                      <td>{c.beds}</td>
                      <td>{c.baths}</td>
                      <td>{c.sqft}</td>
                      <td className="font-semibold text-neutral-900">${c.adjusted_price?.toLocaleString()}</td>
                      <td>{Math.max(0, Math.round((Date.now() - new Date(c.closed_or_listed_date).getTime()) / 86400000))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      {/* Right rail */}
      <aside className="lg:col-span-4 w-full flex flex-col gap-4 items-stretch mt-8 lg:mt-0">
        <a
          href={buildCalendlyUrl(addressStr)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book a tour for this property"
        >
          <Button className="w-full h-12 text-lg font-bold shadow-lift hover:-translate-y-1 transition-transform">Book a tour</Button>
        </a>
        <a
          href={`/api/pdf/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download PDF report"
        >
          <Button variant="outline" className="w-full h-12 flex items-center gap-2 shadow-soft hover:-translate-y-1 transition-transform">
            <Download className="w-5 h-5" /> Download PDF
          </Button>
        </a>
      </aside>
    </div>
  );
}
