"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Slider } from "../../components/ui/slider";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Check, RefreshCw } from "lucide-react";

const schema = z.object({
  address: z.string().min(3, "Address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  zip: z.string().min(5, "ZIP required").max(10),
  beds: z.coerce.number().int().min(0).max(12),
  baths: z.coerce.number().min(0).max(10).refine(v => v * 2 === Math.round(v * 2), { message: "Baths must be in 0.5 steps" }),
  sqft: z.coerce.number().int().min(300, "Min 300 sqft"),
  type: z.enum(["apartment", "condo", "single_family", "townhome"]),
  condition: z.coerce.number().int().min(1).max(5),
  tenure: z.enum(["rent", "sale"]),
});

type FormValues = z.infer<typeof schema>;

const propertyTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "single_family", label: "Single Family" },
  { value: "townhome", label: "Townhome" },
];

export default function EstimatePage() {
  const [loading, setLoading] = useState(false);
  const [skeleton, setSkeleton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      beds: 3,
      baths: 2,
      sqft: 1200,
      type: "condo",
      condition: 3,
      tenure: "sale",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setSkeleton(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            street: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
          },
          property: {
            beds: data.beds,
            baths: data.baths,
            sqft: data.sqft,
            type: data.type,
            condition: data.condition,
            tenure: data.tenure,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to estimate");
      const result = await res.json();
      router.push(`/results/${result.id}`);
    } catch (e) {
      setError("Could not get estimate. Please try again.");
    } finally {
      setLoading(false);
      setSkeleton(false);
    }
  };

  // For slider ticks
  const condition = watch("condition");
  const tenure = watch("tenure");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
      <div className="lg:col-span-7 xl:col-span-8 w-full">
        <Card className="w-full p-8 bg-white/80 border-0 shadow-soft relative overflow-hidden" style={{ borderRadius: "1.25rem", boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)" }}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} aria-describedby="form-error" aria-live="polite">
            <h2 className="font-heading text-2xl font-bold mb-2">Estimate your property</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="address" className="block text-sm font-medium mb-1">Street address</label>
                <Input id="address" placeholder="Street address" aria-invalid={!!errors.address} aria-describedby={errors.address ? "address-error" : undefined} {...register("address")} disabled={loading} />
                <div id="address-error" aria-live="polite" className="text-xs text-red-500 mt-1 min-h-[18px]">{errors.address?.message}</div>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                <Input id="city" placeholder="City" aria-invalid={!!errors.city} aria-describedby={errors.city ? "city-error" : undefined} {...register("city")} disabled={loading} />
                <div id="city-error" aria-live="polite" className="text-xs text-red-500 mt-1 min-h-[18px]">{errors.city?.message}</div>
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
                <Input id="state" placeholder="State" aria-invalid={!!errors.state} aria-describedby={errors.state ? "state-error" : undefined} {...register("state")} disabled={loading} />
                <div id="state-error" aria-live="polite" className="text-xs text-red-500 mt-1 min-h-[18px]">{errors.state?.message}</div>
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium mb-1">ZIP</label>
                <Input id="zip" placeholder="ZIP" aria-invalid={!!errors.zip} aria-describedby={errors.zip ? "zip-error" : undefined} {...register("zip")} disabled={loading} />
                <div id="zip-error" aria-live="polite" className="text-xs text-red-500 mt-1 min-h-[18px]">{errors.zip?.message}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="beds" className="block text-sm font-medium mb-1">Bedrooms</label>
                <Input id="beds" type="number" min={0} max={12} step={1} placeholder="Beds" aria-invalid={!!errors.beds} aria-describedby={errors.beds ? "beds-error" : undefined} {...register("beds")} disabled={loading} />
                <div id="beds-error" aria-live="polite" className="text-xs text-red-500 min-h-[18px]">{errors.beds?.message}</div>
              </div>
              <div>
                <label htmlFor="baths" className="block text-sm font-medium mb-1">Baths (0.5 steps)</label>
                <Input id="baths" type="number" min={0} max={10} step={0.5} placeholder="Baths" aria-invalid={!!errors.baths} aria-describedby={errors.baths ? "baths-error" : undefined} {...register("baths")} disabled={loading} />
                <div id="baths-error" aria-live="polite" className="text-xs text-red-500 min-h-[18px]">{errors.baths?.message}</div>
              </div>
              <div>
                <label htmlFor="sqft" className="block text-sm font-medium mb-1">Living area (sqft)</label>
                <Input id="sqft" type="number" min={300} step={1} placeholder="Sqft" aria-invalid={!!errors.sqft} aria-describedby={errors.sqft ? "sqft-error" : undefined} {...register("sqft")} disabled={loading} />
                <div id="sqft-error" aria-live="polite" className="text-xs text-red-500 min-h-[18px]">{errors.sqft?.message}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="type" className="block text-sm font-medium mb-1">Property type</label>
                <Select value={watch("type")} onValueChange={v => setValue("type", v as any)} disabled={loading}>
                  <SelectTrigger className="w-40" id="type">
                    <SelectValue placeholder="Property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(pt => (
                      <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 ml-2">
                <label className="block text-sm font-medium mb-1">Tenure</label>
                <Tabs value={tenure} onValueChange={v => setValue("tenure", v as any)} className="">
                  <TabsList>
                    <TabsTrigger value="rent">Rent</TabsTrigger>
                    <TabsTrigger value="sale">Sale</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="condition" className="block text-sm font-medium mb-1">Condition</label>
              <div className="flex items-center gap-2">
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[condition]}
                  onValueChange={v => setValue("condition", v[0])}
                  disabled={loading}
                  className="w-48"
                  id="condition"
                  aria-valuenow={condition}
                  aria-valuemin={1}
                  aria-valuemax={5}
                  aria-label="Condition"
                />
                <div className="flex gap-1 ml-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} className={`w-6 text-center text-xs ${condition === n ? "font-bold text-accent-500" : "text-neutral-400"}`}>{n}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-1">1 = Needs work, 3 = Average, 5 = Excellent</p>
              <div id="condition-error" aria-live="polite" className="text-xs text-red-500 min-h-[18px]">{errors.condition?.message}</div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loading} aria-busy={loading} aria-live="polite">
              {loading ? "Estimating..." : "Get Estimate"}
            </Button>
            {error && (
              <div className="mt-2 text-red-600 flex items-center gap-2" id="form-error" aria-live="assertive">
                {error}
                <Button type="button" variant="outline" size="sm" onClick={handleSubmit(onSubmit)} className="ml-2" disabled={loading} aria-label="Retry">
                  <RefreshCw className="w-4 h-4 mr-1" /> Retry
                </Button>
              </div>
            )}
          </form>
          {skeleton && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10" aria-hidden="true">
              <Skeleton className="w-2/3 h-8 mb-4" />
              <Skeleton className="w-full h-6 mb-2" />
              <Skeleton className="w-full h-6 mb-2" />
              <Skeleton className="w-full h-6 mb-2" />
              <Skeleton className="w-1/2 h-10 mt-4" />
            </div>
          )}
        </Card>
      </div>
      <aside className="lg:col-span-5 xl:col-span-4 w-full bg-white/70 rounded-2xl shadow-soft p-6 border border-neutral-100 mt-8 lg:mt-0">
        <h3 className="font-heading text-lg font-bold mb-4">What we’ll compute</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-500" /> Market value estimate</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-500" /> Confidence range</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-500" /> Comparable sales/rentals</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-500" /> Adjustment breakdowns</li>
        </ul>
      </aside>
    </div>
  );
}
