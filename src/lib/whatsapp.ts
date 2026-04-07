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

export function buildWhatsAppMessage(items: CartItem[], total: number): string {
  let message = "🐐 *NUEVO PEDIDO - GOAT SPORTWEAR*\n\n";

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
  message += `💰 *TOTAL: $${total.toLocaleString("es-AR")}*\n`;
  message += `━━━━━━━━━━━━━━━━\n\n`;
  message += `Quedo esperando confirmación. ¡Gracias! 😊`;

  return message;
}

export function getWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493491406188";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
