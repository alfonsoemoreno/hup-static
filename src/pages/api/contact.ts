import type { APIRoute } from "astro";

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const CONTACT_TO = import.meta.env.CONTACT_TO || "hotelultimoparaisochile@hotmail.es";
const CONTACT_FROM =
  import.meta.env.CONTACT_FROM || "Hotel Ultimo Paraiso <no-reply@hup.vercel.app>";

export const POST: APIRoute = async ({ request }) => {
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ message: "Missing RESEND_API_KEY on server" }),
      { status: 500 }
    );
  }

  let payload: Record<string, string>;
  try {
    payload = await request.json();
  } catch (_) {
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim();
  const message = (payload.message || "").trim();

  if (!email || !message) {
    return new Response(JSON.stringify({ message: "Email and message are required" }), {
      status: 400,
    });
  }

  const subject = "Nuevo contacto desde el sitio Hotel Último Paraíso";
  const text = `Nombre: ${name || "No indicado"}
Email: ${email}

Mensaje:
${message}`;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      subject,
      text,
      reply_to: email,
    }),
  });

  if (!resendRes.ok) {
    const errorText = await safeText(resendRes);
    return new Response(
      JSON.stringify({
        message: "Failed to send email",
        error: errorText || resendRes.statusText,
      }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ message: "sent" }), { status: 200 });
};

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch (_) {
    return "";
  }
}
