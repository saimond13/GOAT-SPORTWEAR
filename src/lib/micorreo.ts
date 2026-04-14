/**
 * MiCorreo API client — JWT token auth + /rates quote endpoint
 * Docs: MiCorreo REST API (Correo Argentino)
 */

const MICORREO_BASE = "https://api.micorreo.com.ar";

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token;
  }

  const user = process.env.MICORREO_USER;
  const password = process.env.MICORREO_PASSWORD;
  if (!user || !password) throw new Error("MICORREO_USER or MICORREO_PASSWORD not set");

  const credentials = Buffer.from(`${user}:${password}`).toString("base64");
  const res = await fetch(`${MICORREO_BASE}/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`MiCorreo auth failed: ${res.status}`);
  }

  const data = await res.json();
  // Token typically valid for 1 hour; assume 55 min to be safe
  tokenCache = {
    token: data.token ?? data.access_token ?? data.jwt,
    expiresAt: now + 55 * 60 * 1000,
  };
  return tokenCache.token;
}

export interface RatesParams {
  postalCodeDestination: string;
  /** "domicilio" or "sucursal" — mapped to deliveredType */
  deliveryType?: "domicilio" | "sucursal";
  weightGrams?: number;
  heightCm?: number;
  widthCm?: number;
  lengthCm?: number;
}

export interface RateOption {
  serviceId: string;
  serviceName: string;
  price: number;
  currency: string;
  deliveryDays?: number;
}

export async function getRates(params: RatesParams): Promise<RateOption[]> {
  const customerId = process.env.MICORREO_CUSTOMER_ID;
  const originCP = process.env.MICORREO_ORIGIN_CP;
  if (!customerId || !originCP) throw new Error("MICORREO_CUSTOMER_ID or MICORREO_ORIGIN_CP not set");

  const token = await getToken();

  // deliveredType: "D" = domicilio, "S" = sucursal
  const deliveredType = params.deliveryType === "sucursal" ? "S" : "D";

  const body = {
    customerId,
    postalCodeOrigin: originCP,
    postalCodeDestination: params.postalCodeDestination,
    deliveredType,
    weight: params.weightGrams ?? 300,
    height: params.heightCm ?? 5,
    width: params.widthCm ?? 30,
    length: params.lengthCm ?? 40,
  };

  const res = await fetch(`${MICORREO_BASE}/rates`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`MiCorreo rates failed: ${res.status}`);
  }

  const data = await res.json();

  // Normalize response — MiCorreo returns an array of rate options
  const raw: RateOption[] = (Array.isArray(data) ? data : data.rates ?? []).map((r: Record<string, unknown>) => ({
    serviceId: String(r.serviceId ?? r.id ?? ""),
    serviceName: String(r.serviceName ?? r.name ?? ""),
    price: Number(r.price ?? r.amount ?? 0),
    currency: String(r.currency ?? "ARS"),
    deliveryDays: r.deliveryDays != null ? Number(r.deliveryDays) : undefined,
  }));

  return raw;
}
