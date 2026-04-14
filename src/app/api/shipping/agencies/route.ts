import { NextResponse } from "next/server";
import { getAgencies } from "@/lib/paqar";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stateId = searchParams.get("stateId") ?? undefined;

  try {
    const agencies = await getAgencies(stateId);
    return NextResponse.json({ agencies });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al obtener sucursales";
    console.error("[shipping/agencies]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
