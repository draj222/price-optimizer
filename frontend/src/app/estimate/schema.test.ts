import { describe, it, expect } from 'vitest';
import * as z from 'zod';

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

describe('estimate schema', () => {
  it('accepts valid data', () => {
    expect(() => schema.parse({
      address: '123 Main St', city: 'X', state: 'CA', zip: '12345', beds: 2, baths: 2.5, sqft: 900, type: 'condo', condition: 3, tenure: 'rent'
    })).not.toThrow();
  });
  it('rejects invalid baths', () => {
    expect(() => schema.parse({
      address: '123 Main St', city: 'X', state: 'CA', zip: '12345', beds: 2, baths: 2.3, sqft: 900, type: 'condo', condition: 3, tenure: 'rent'
    })).toThrow();
  });
  it('rejects sqft < 300', () => {
    expect(() => schema.parse({
      address: '123 Main St', city: 'X', state: 'CA', zip: '12345', beds: 2, baths: 2, sqft: 299, type: 'condo', condition: 3, tenure: 'rent'
    })).toThrow();
  });
});
