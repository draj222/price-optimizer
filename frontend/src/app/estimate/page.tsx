"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@shadcn/ui/card";
import { Input } from "@shadcn/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shadcn/ui/select";
import { Slider } from "@shadcn/ui/slider";
import { Badge } from "@shadcn/ui/badge";
import { Skeleton } from "@shadcn/ui/skeleton";
import { Button } from "@shadcn/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@shadcn/ui/tabs";
import { Check } from "lucide-react";

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
      // TODO: show error toast
    } finally {
      setLoading(false);
      setSkeleton(false);
    }
  };

  // For slider ticks
  const condition = watch("condition");
  const tenure = watch("tenure");

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
      <Card className="w-full max-w-lg p-8 bg-white/80 border-0 shadow-soft relative overflow-hidden" style={{ borderRadius: "1.25rem", boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)" }}>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="font-heading text-2xl font-bold mb-2">Estimate your property</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input placeholder="Street address" {...register("address")} disabled={loading} />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <Input placeholder="City" {...register("city")} disabled={loading} />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Input placeholder="State" {...register("state")} disabled={loading} />
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <Input placeholder="ZIP" {...register("zip")} disabled={loading} />
              {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Input type="number" min={0} max={12} step={1} placeholder="Beds" {...register("beds")} disabled={loading} />
              <p className="text-xs text-neutral-500">Bedrooms</p>
              {errors.beds && <p className="text-xs text-red-500">{errors.beds.message}</p>}
            </div>
            <div>
              <Input type="number" min={0} max={10} step={0.5} placeholder="Baths" {...register("baths")} disabled={loading} />
              <p className="text-xs text-neutral-500">Baths (0.5 steps)</p>
              {errors.baths && <p className="text-xs text-red-500">{errors.baths.message}</p>}
            </div>
            <div>
              <Input type="number" min={300} step={1} placeholder="Sqft" {...register("sqft")} disabled={loading} />
              <p className="text-xs text-neutral-500">Living area</p>
              {errors.sqft && <p className="text-xs text-red-500">{errors.sqft.message}</p>}
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={watch("type")} onValueChange={v => setValue("type", v as any)} disabled={loading}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map(pt => (
                  <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={tenure} onValueChange={v => setValue("tenure", v as any)} className="ml-2">
              <TabsList>
                <TabsTrigger value="rent">Rent</TabsTrigger>
                <TabsTrigger value="sale">Sale</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Condition</label>
            <div className="flex items-center gap-2">
              <Slider
                min={1}
                max={5}
                step={1}
                value={[condition]}
                onValueChange={v => setValue("condition", v[0])}
                disabled={loading}
                className="w-48"
              />
              <div className="flex gap-1 ml-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} className={`w-6 text-center text-xs ${condition === n ? "font-bold text-accent-500" : "text-neutral-400"}`}>{n}</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-1">1 = Needs work, 3 = Average, 5 = Excellent</p>
            {errors.condition && <p className="text-xs text-red-500">{errors.condition.message}</p>}
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Estimating..." : "Get Estimate"}
          </Button>
        </form>
        {skeleton && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
            <Skeleton className="w-2/3 h-8 mb-4" />
            <Skeleton className="w-full h-6 mb-2" />
            <Skeleton className="w-full h-6 mb-2" />
            <Skeleton className="w-full h-6 mb-2" />
            <Skeleton className="w-1/2 h-10 mt-4" />
          </div>
        )}
      </Card>
      <aside className="w-full max-w-xs bg-white/70 rounded-2xl shadow-soft p-6 border border-neutral-100">
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
