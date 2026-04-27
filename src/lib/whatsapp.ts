export interface CartItem {
  product: {
    id: number | string;
    name: string;
    price: number;
    image?: string;
  };
  size: string;
  quantity: number;
  paymentMethod: string;
}

export interface ShippingData {
  type: "domicilio" | "sucursal" | "";
  address: string;
  postalCode: string;
  city: string;
  recipientName?: string;
  recipientPhone?: string;
  agencyId?: string;
  quotedPrice?: number;
  quotedService?: string;
}

export function buildWhatsAppMessage(
  items: CartItem[],
  total: number,
  shipping?: ShippingData,
  transferDiscount?: number,
  orderRef?: string
): string {
  const FREE_SHIPPING_THRESHOLD = 100_000;
  const finalTotal = transferDiscount ? total - transferDiscount : total;
  const isFreeShipping = finalTotal >= FREE_SHIPPING_THRESHOLD;

  let message = "🐐 *NUEVO PEDIDO - GOAT SPORTWEAR*\n";
  if (orderRef) message += `🔖 Pedido #${orderRef}\n`;
  message += "\n";

  items.forEach((item, i) => {
    message += `*Producto ${i + 1}:*\n`;
    message += `• Nombre: ${item.product.name}\n`;
    message += `• Precio unitario: $${item.product.price.toLocaleString("es-AR")}\n`;
    message += `• Talle: ${item.size}\n`;
    message += `• Cantidad: ${item.quantity}\n`;
    message += `• Subtotal: $${(item.product.price * item.quantity).toLocaleString("es-AR")}\n`;
    message += `• Método de pago: ${item.paymentMethod}\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━\n`;
  if (transferDiscount && transferDiscount > 0) {
    message += `💰 Subtotal: $${total.toLocaleString("es-AR")}\n`;
    message += `🎁 Descuento transferencia (15%): -$${transferDiscount.toLocaleString("es-AR")}\n`;
    message += `💰 *TOTAL FINAL: $${finalTotal.toLocaleString("es-AR")}*\n`;
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `🏦 *DATOS PARA TRANSFERIR:*\n`;
    message += `• Titular: Tadeo Vanstrate\n`;
    message += `• Alias MP: vanstrate\n`;
    message += `• Plataforma: Mercado Pago\n`;
  } else {
    message += `💰 *TOTAL: $${finalTotal.toLocaleString("es-AR")}*\n`;
  }

  if (isFreeShipping) {
    message += `🚚 *ENVÍO GRATIS* ✅\n`;
  }

  if (shipping?.type === "domicilio") {
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `📦 *ENVÍO A DOMICILIO (Correo Argentino)*\n`;
    if (shipping.recipientName) message += `• Destinatario: ${shipping.recipientName}\n`;
    if (shipping.recipientPhone) message += `• Teléfono: ${shipping.recipientPhone}\n`;
    if (shipping.address) message += `• Dirección: ${shipping.address}\n`;
    if (shipping.city) message += `• Localidad: ${shipping.city}\n`;
    if (shipping.postalCode) message += `• Código postal: ${shipping.postalCode}\n`;
    if (shipping.quotedService && shipping.quotedPrice != null) {
      message += `• Servicio: ${shipping.quotedService} — $${shipping.quotedPrice.toLocaleString("es-AR")}\n`;
    }
  } else if (shipping?.type === "sucursal") {
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `🏪 *RETIRO EN SUCURSAL (Correo Argentino)*\n`;
    if (shipping.recipientName) message += `• Destinatario: ${shipping.recipientName}\n`;
    if (shipping.recipientPhone) message += `• Teléfono: ${shipping.recipientPhone}\n`;
    if (shipping.city) message += `• Localidad: ${shipping.city}\n`;
    if (shipping.postalCode) message += `• Código postal: ${shipping.postalCode}\n`;
    if (shipping.agencyId) message += `• Sucursal ID: ${shipping.agencyId}\n`;
    if (shipping.quotedService && shipping.quotedPrice != null) {
      message += `• Servicio: ${shipping.quotedService} — $${shipping.quotedPrice.toLocaleString("es-AR")}\n`;
    }
  }

  message += `━━━━━━━━━━━━━━━━\n\n`;
  message += `Quedo esperando confirmación. ¡Gracias! 😊`;

  return message;
}

export function getWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) throw new Error("NEXT_PUBLIC_WHATSAPP_NUMBER is not set");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
