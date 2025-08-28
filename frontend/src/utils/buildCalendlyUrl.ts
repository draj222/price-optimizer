export function buildCalendlyUrl(addressStr: string): string {
  const base = process.env.NEXT_PUBLIC_CALENDLY_URL;
  const prefill = encodeURIComponent(`Tour for ${addressStr}`);
  if (base) {
    // Calendly supports prefill via query param (may vary by integration)
    return `${base}${base.includes('?') ? '&' : '?'}text=${prefill}`;
  } else {
    const subject = encodeURIComponent("Tour request");
    const body = encodeURIComponent(`I'd like to book a tour for: ${addressStr}`);
    return `mailto:?subject=${subject}&body=${body}`;
  }
}
