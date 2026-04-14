/**
 * PAQ.AR v2 API client — Apikey + agreement header auth
 * Docs: PAQ.AR API v2
 */

const PAQAR_BASE = "https://api.paq.ar/v1";

function headers(): HeadersInit {
  const apiKey = process.env.PAQAR_API_KEY;
  const agreement = process.env.PAQAR_AGREEMENT;
  if (!apiKey || !agreement) throw new Error("PAQAR_API_KEY or PAQAR_AGREEMENT not set");
  return {
    "Authorization": `Apikey ${apiKey}`,
    "agreement": agreement,
    "Content-Type": "application/json",
  };
}

// ── Agencies ──────────────────────────────────────────────────────────────────

export interface Agency {
  id: string;
  name: string;
  address: string;
  city: string;
  stateId: string;
  postalCode: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export async function getAgencies(stateId?: string): Promise<Agency[]> {
  const url = new URL(`${PAQAR_BASE}/agencies`);
  if (stateId) url.searchParams.set("stateId", stateId);

  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`PAQ.AR agencies failed: ${res.status}`);

  const data = await res.json();
  return Array.isArray(data) ? data : data.agencies ?? [];
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  description: string;
  quantity: number;
  weight: number;   // grams
  height: number;   // cm
  width: number;    // cm
  length: number;   // cm
}

export interface RecipientAddress {
  street: string;
  number?: string;
  floor?: string;
  apartment?: string;
  city: string;
  stateId: string;
  postalCode: string;
  country?: string;
}

export interface CreateOrderParams {
  deliveryType: "homeDelivery" | "agency";
  recipient: {
    name: string;
    phone: string;
    email?: string;
  };
  /** Required for homeDelivery */
  address?: RecipientAddress;
  /** Required for agency delivery */
  agencyId?: string;
  items: OrderItem[];
  declaredValue?: number;
  externalReference?: string;
}

export interface CreatedOrder {
  orderId: string;
  trackingCode: string;
  labelUrl?: string;
  status: string;
}

export async function createOrder(params: CreateOrderParams): Promise<CreatedOrder> {
  const res = await fetch(`${PAQAR_BASE}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PAQ.AR createOrder failed: ${res.status} — ${text}`);
  }
  return res.json();
}

// ── Labels ────────────────────────────────────────────────────────────────────

export async function getLabel(orderId: string): Promise<string> {
  const res = await fetch(`${PAQAR_BASE}/labels/${orderId}`, { headers: headers() });
  if (!res.ok) throw new Error(`PAQ.AR getLabel failed: ${res.status}`);
  const data = await res.json();
  return data.labelUrl ?? data.url ?? data.pdf;
}

// ── Tracking ──────────────────────────────────────────────────────────────────

export interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location?: string;
}

export async function getTracking(trackingCode: string): Promise<TrackingEvent[]> {
  const res = await fetch(`${PAQAR_BASE}/tracking/${trackingCode}`, { headers: headers() });
  if (!res.ok) throw new Error(`PAQ.AR tracking failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.events ?? [];
}
