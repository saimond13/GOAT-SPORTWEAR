export interface InfoSection {
  title: string;
  content: { heading?: string; body: string }[];
}

export const INFO_CONTENT: Record<string, InfoSection> = {
  "como-comprar": {
    title: "Cómo comprar",
    content: [
      {
        heading: "Es muy fácil",
        body: "Comprarnos es simple y rápido. Todo el proceso se hace a través de WhatsApp, así te asegurás de hablar directamente con nosotros y que tu pedido quede confirmado.",
      },
      {
        heading: "1. Elegí tu producto",
        body: "Navegá nuestro catálogo, elegí la prenda que más te guste, seleccioná el talle y la cantidad. Hacé clic en 'Ver Catálogo' para explorar todo lo disponible.",
      },
      {
        heading: "2. Seleccioná talle y método de pago",
        body: "En la página de cada producto podés ver las tallas disponibles y elegir tu forma de pago preferida (efectivo, transferencia, Mercado Pago o tarjeta).",
      },
      {
        heading: "3. Agregá al carrito",
        body: "Una vez que elegiste el talle y el método de pago, hacé clic en 'Agregar al carrito'. Podés agregar varios productos antes de finalizar.",
      },
      {
        heading: "4. Finalizá por WhatsApp",
        body: "Cuando tengas todo listo, hacé clic en 'Enviar pedido por WhatsApp'. Se va a abrir una conversación con nosotros con todos los detalles de tu pedido ya escritos. Confirmamos disponibilidad y acordamos la entrega o el envío.",
      },
      {
        heading: "Local físico",
        body: "También podés pasar directamente por nuestro local en 25 de Mayo 115, S3011 Sa Pereira, Santa Fe. Atendemos de lunes a sábados. Consultá horarios por WhatsApp antes de venir.",
      },
    ],
  },

  "metodos-de-pago": {
    title: "Métodos de pago",
    content: [
      {
        heading: "Efectivo",
        body: "Pagás en el momento de recibir tu pedido (en el local o contra entrega en Sa Pereira). No tiene recargo.",
      },
      {
        heading: "Transferencia bancaria",
        body: "Transferís el monto exacto a nuestro alias o CBU. Te lo informamos por WhatsApp al confirmar el pedido. Una vez acreditado el pago, preparamos y despachamos tu pedido.",
      },
      {
        heading: "Mercado Pago",
        body: "Aceptamos pagos por Mercado Pago (link de pago o QR). Puede aplicar un pequeño recargo según el método de cobro. Consultá al momento de hacer el pedido.",
      },
      {
        heading: "Tarjeta de crédito y débito",
        body: "Aceptamos tarjetas de crédito y débito a través de Mercado Pago. Tarjeta de débito sin recargo. Tarjeta de crédito en 1 pago sin recargo; en cuotas consultá disponibilidad.",
      },
      {
        heading: "Importante",
        body: "No reservamos prendas sin señal o pago. Para pedidos de envío, el pago debe estar acreditado antes de despachar. Ante cualquier duda consultanos por WhatsApp.",
      },
    ],
  },

  "envios-y-plazos": {
    title: "Envíos y plazos",
    content: [
      {
        heading: "Envíos a todo el país",
        body: "Despachamos por Correo Argentino a cualquier punto del país. Los costos de envío son calculados según el destino y el peso del paquete. Te informamos el costo exacto al confirmar el pedido.",
      },
      {
        heading: "Plazos estimados",
        body: "Una vez despachado, los tiempos de entrega estimados son: Capital Federal y GBA: 3 a 5 días hábiles. Interior del país: 5 a 10 días hábiles. Zonas alejadas: puede extenderse hasta 15 días hábiles.",
      },
      {
        heading: "Preparación del pedido",
        body: "Preparamos tu pedido en 1 a 2 días hábiles después de confirmar el pago. Te enviamos el número de seguimiento por WhatsApp en cuanto despachamos.",
      },
      {
        heading: "Seguimiento",
        body: "Todos los envíos tienen número de seguimiento del Correo Argentino. Podés rastrear tu paquete en correoargentino.com.ar con el código que te enviamos.",
      },
      {
        heading: "Retiro en local",
        body: "Si estás en Sa Pereira o zonas cercanas, podés retirar tu pedido sin costo directamente en nuestro local en 25 de Mayo 115. Coordinamos el horario por WhatsApp.",
      },
    ],
  },

  "cambios-y-devoluciones": {
    title: "Cambios y devoluciones",
    content: [
      {
        heading: "Cambio de talle",
        body: "Aceptamos cambios de talle dentro de los 7 días corridos desde que recibís el pedido, siempre que la prenda esté sin uso, con etiquetas y en perfectas condiciones. El costo del envío de vuelta corre por cuenta del comprador; el reenvío del talle correcto lo cubrimos nosotros.",
      },
      {
        heading: "Cambio de producto",
        body: "Podés cambiar el producto por otro de igual o mayor valor dentro de los 7 días. La diferencia de precio se abona al momento del cambio. Las prendas deben estar sin uso, sin lavado y con etiquetas originales.",
      },
      {
        heading: "Devoluciones",
        body: "En caso de que el producto presente una falla de fábrica o sea diferente al publicado, hacemos la devolución completa del dinero o el cambio según prefieras. Contactanos dentro de las 48 horas de recibir el pedido con fotos del inconveniente.",
      },
      {
        heading: "No aceptamos cambios ni devoluciones cuando",
        body: "La prenda fue usada, lavada o alterada. Pasaron más de 7 días desde la recepción. El producto fue comprado en oferta o liquidación (salvo falla de fábrica). La prenda no tiene etiquetas.",
      },
      {
        heading: "¿Cómo iniciar un cambio?",
        body: "Escribinos por WhatsApp con tu número de pedido y el motivo del cambio. Te respondemos en menos de 24 horas y te guiamos en el proceso.",
      },
    ],
  },

  "preguntas-frecuentes": {
    title: "Preguntas frecuentes",
    content: [
      {
        heading: "¿Tienen local físico?",
        body: "Sí. Estamos en 25 de Mayo 115, S3011 Sa Pereira, Provincia de Santa Fe. Podés venir a ver las prendas y comprar en el momento. Consultá horarios por WhatsApp antes de venir.",
      },
      {
        heading: "¿Cómo sé qué talle me queda?",
        body: "Trabajamos con talles estándar argentinos (XS al XXXL). Si tenés dudas, escribinos con tus medidas (pecho, cintura, largo) y te asesoramos sin compromiso. También podés ver las guías de talle de cada prenda en la página del producto.",
      },
      {
        heading: "¿Las prendas son originales?",
        body: "Sí, todas nuestras prendas son 100% originales. Trabajamos con proveedores de confianza y garantizamos la calidad de cada producto que vendemos.",
      },
      {
        heading: "¿Puedo reservar una prenda?",
        body: "Reservamos prendas con seña (50% del valor del producto) con disponibilidad por 48 horas. Pasado ese plazo sin confirmar el pago total, la reserva se libera automáticamente.",
      },
      {
        heading: "¿Hacen descuentos por cantidad?",
        body: "Sí, para compras de 3 prendas o más hacemos descuentos especiales. Consultanos por WhatsApp antes de hacer el pedido para que te informemos las promociones vigentes.",
      },
      {
        heading: "¿Cuánto tarda en llegar mi pedido?",
        body: "Preparamos el pedido en 1-2 días hábiles y luego los tiempos de Correo Argentino son de 3 a 10 días hábiles según destino. Te mandamos el número de seguimiento en cuanto despachamos.",
      },
      {
        heading: "¿Puedo seguir mi pedido?",
        body: "Sí. Todos los envíos tienen número de seguimiento que te enviamos por WhatsApp. Podés rastrearlo en correoargentino.com.ar.",
      },
      {
        heading: "¿Cómo los contacto?",
        body: "Por WhatsApp al +54 9 3491 406188 o por Instagram @goatsportwear_. Respondemos todos los días de 9 a 21 hs.",
      },
    ],
  },
};
