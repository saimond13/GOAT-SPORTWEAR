import { NextResponse } from "next/server";
import { z } from "zod";
import { getRates } from "@/lib/micorreo";

const schema = z.object({
  postalCode: z.string().min(4).max(8),
  deliveryType: z.enum(["domicilio", "sucursal"]).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const rates = await getRates({
      postalCodeDestination: parsed.data.postalCode,
      deliveryType: parsed.data.deliveryType,
    });
    return NextResponse.json({ rates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cotizar envío";
    console.error("[shipping/quote]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
