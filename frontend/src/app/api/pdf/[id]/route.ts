import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

export const dynamic = "force-dynamic";

async function fetchEstimate(id: string) {
  const res = await fetch(`http://localhost:8000/estimate/${id}`);
  if (!res.ok) throw new Error("Estimate not found");
  return res.json();
}

function renderHtml(data: any) {
  const comps = data.comps.slice(0, 5);
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Price Optimizer Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Sora:wght@700&display=swap');
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; color: #222; }
        .header { background: #f8fafc; padding: 24px 32px 12px 32px; border-bottom: 2px solid #e5e7eb; }
        .logo { font-family: 'Sora', sans-serif; font-size: 2rem; font-weight: 700; color: #6366f1; letter-spacing: -1px; }
        .address { font-size: 1.1rem; margin-top: 4px; color: #444; }
        .timestamp { font-size: 0.9rem; color: #888; margin-top: 2px; }
        .main { padding: 32px; }
        .range { font-size: 2.2rem; font-weight: 700; color: #222; margin-bottom: 8px; }
        .point { font-size: 1.2rem; color: #6366f1; font-weight: 700; }
        .confidence { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.95rem; font-weight: 600; background: #e0e7ef; color: #444; margin-bottom: 16px; }
        .comps { margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.98rem; }
        th, td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
        th { background: #f1f5f9; text-align: left; font-weight: 700; }
        tr:nth-child(even) { background: #f8fafc; }
        .footnote { margin-top: 32px; font-size: 0.92rem; color: #888; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Price Optimizer</div>
        <div class="address">${comps[0]?.address || "Property"}</div>
        <div class="timestamp">${new Date(data.created_at).toLocaleString()}</div>
      </div>
      <div class="main">
        <div class="range">${data.range_low.toLocaleString()} – ${data.range_high.toLocaleString()}</div>
        <div class="point">Median: ${data.point_estimate.toLocaleString()}</div>
        <div class="confidence">Confidence: ${data.confidence}</div>
        <div class="comps">
          <div style="font-weight:600;margin-bottom:6px;">Top 5 Comparables</div>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Dist (km)</th>
                <th>Beds</th>
                <th>Baths</th>
                <th>Sqft</th>
                <th>Adj. Price</th>
                <th>Days Ago</th>
              </tr>
            </thead>
            <tbody>
              ${comps.map((c: any) => `
                <tr>
                  <td>${c.address}</td>
                  <td>${c.distance_km.toFixed(2)}</td>
                  <td>${c.beds}</td>
                  <td>${c.baths}</td>
                  <td>${c.sqft}</td>
                  <td>${c.adjusted_price?.toLocaleString()}</td>
                  <td>${Math.max(0, Math.round((Date.now() - new Date(c.closed_or_listed_date).getTime()) / 86400000))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <div class="footnote">Adjustments are made for size, condition, and recency to provide a fair market estimate. This report is for informational purposes only.</div>
      </div>
    </body>
  </html>
  `;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  let browser: puppeteer.Browser | null = null;
  try {
    const data = await fetchEstimate(id);
    const html = renderHtml(data);
    browser = await puppeteer.launch({ args: ["--no-sandbox", "--font-render-hinting=none"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "letter",
      printBackground: true,
      width: "8.5in",
      height: "11in",
      margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
      pageRanges: "1",
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      timeout: 10000,
      scale: 1,
      // embed fonts via Google Fonts in HTML
    });
    await page.close();
    await browser.close();
    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=estimate-${id}.pdf`,
      },
    });
  } catch (e: any) {
    if (browser) await browser.close();
    return new Response(`PDF generation failed: ${e.message}`, { status: 500 });
  }
}
