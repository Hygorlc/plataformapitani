import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";

export async function POST(req: Request) {
  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId é obrigatório." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, price_cents, status")
    .eq("id", courseId)
    .single();

  if (!course || course.status !== "published" || course.price_cents <= 0) {
    return NextResponse.json({ error: "Curso inválido para compra." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Pagamentos ainda não configurados nesta plataforma." },
      { status: 503 }
    );
  }

  try {
    const stripe = getStripeClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { name: course.title },
            unit_amount: course.price_cents,
          },
          quantity: 1,
        },
      ],
      metadata: { user_id: user.id, course_id: course.id },
      success_url: `${siteUrl}/courses/${course.slug}?enrolled=1`,
      cancel_url: `${siteUrl}/courses/${course.slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao iniciar pagamento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
