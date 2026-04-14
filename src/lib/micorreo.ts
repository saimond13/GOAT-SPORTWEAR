/**
 * MiCorreo API client — JWT token auth + /rates quote endpoint
 * Base URL: https://api.correoargentino.com.ar/micorreo/v1
 */

const MICORREO_BASE = "https://api.correoargentino.com.ar/micorreo/v1";

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
  if (!user || !password) throw new Error("MICORREO_USER o MICORREO_PASSWORD no configurados");

  const credentials = Buffer.from(`${user}:${password}`).toString("base64");
  const res = await fetch(`${MICORREO_BASE}/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MiCorreo auth falló: ${res.status} — ${text}`);
  }

  const data = await res.json();
  // Token dura ~2hs, cacheamos por 55 min para renovar antes de que expire
  tokenCache = {
    token: data.token,
    expiresAt: now + 55 * 60 * 1000,
  };
  return tokenCache.token;
}

export interface RatesParams {
  postalCodeDestination: string;
  /** "domicilio" → "D" | "sucursal" → "S" | undefined → devuelve ambas */
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
  deliveryType: "D" | "S";
  deliveryTimeMin?: string;
  deliveryTimeMax?: string;
}

export async function getRates(params: RatesParams): Promise<RateOption[]> {
  const customerId = process.env.MICORREO_CUSTOMER_ID;
  const originCP = process.env.MICORREO_ORIGIN_CP;
  if (!customerId || !originCP) throw new Error("MICORREO_CUSTOMER_ID o MICORREO_ORIGIN_CP no configurados");

  const token = await getToken();

  const body: Record<string, unknown> = {
    customerId,
    postalCodeOrigin: originCP,
    postalCodeDestination: params.postalCodeDestination,
    dimensions: {
      weight: params.weightGrams ?? 300,
      height: params.heightCm ?? 5,
      width: params.widthCm ?? 30,
      length: params.lengthCm ?? 40,
    },
  };

  // Si se especifica tipo, se filtra; sin tipo devuelve D y S juntos
  if (params.deliveryType) {
    body.deliveredType = params.deliveryType === "sucursal" ? "S" : "D";
  }

  const res = await fetch(`${MICORREO_BASE}/rates`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MiCorreo /rates falló: ${res.status} — ${text}`);
  }

  const data = await res.json();

  return (data.rates ?? []).map((r: Record<string, unknown>) => ({
    serviceId: String(r.productType ?? ""),
    serviceName: String(r.productName ?? ""),
    price: Number(r.price ?? 0),
    deliveryType: (r.deliveredType ?? "D") as "D" | "S",
    deliveryTimeMin: r.deliveryTimeMin != null ? String(r.deliveryTimeMin) : undefined,
    deliveryTimeMax: r.deliveryTimeMax != null ? String(r.deliveryTimeMax) : undefined,
  }));
}
