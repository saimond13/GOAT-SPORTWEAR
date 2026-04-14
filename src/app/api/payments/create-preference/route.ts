import { NextResponse } from "next/server";
import { z } from "zod";
import MercadoPagoConfig, { Preference } from "mercadopago";

const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  size: z.string(),
});

const schema = z.object({
  items: z.array(itemSchema).min(1),
  payer: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
});

function getClient() {
  const isTest = process.env.NEXT_PUBLIC_MP_ENV === "test";
  const token = isTest
    ? process.env.MERCADOPAGO_ACCESS_TOKEN_TEST
    : process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return new MercadoPagoConfig({ accessToken: token });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { items, payer } = parsed.data;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goat.mileadflow.com";

  try {
    const client = getClient();
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          id: item.id,
          title: `${item.name} — Talle ${item.size}`,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "ARS",
        })),
        back_urls: {
          success: `${origin}/pago/exitoso`,
          failure: `${origin}/pago/fallido`,
          pending: `${origin}/pago/pendiente`,
        },
        auto_return: "approved",
        ...(payer?.email ? { payer: { email: payer.email } } : {}),
        statement_descriptor: "GOAT SPORTWEAR",
        expires: false,
      },
    });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear preferencia";
    console.error("[payments/create-preference]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
