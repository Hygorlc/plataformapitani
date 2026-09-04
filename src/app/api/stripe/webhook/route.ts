import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assinatura inválida.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error: claimError } = await admin.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
  });

  if (claimError?.code === "23505") {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (claimError) {
    return NextResponse.json({ error: "Falha ao registrar evento." }, { status: 500 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const courseId = session.metadata?.course_id;

      if (userId && courseId) {
        const { error: enrollmentError } = await admin.from("enrollments").upsert(
          {
            user_id: userId,
            course_id: courseId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            amount_paid_cents: session.amount_total ?? 0,
            status: "active",
          },
          { onConflict: "user_id,course_id" }
        );
        if (enrollmentError) throw enrollmentError;

        const { error: profileError } = await admin
          .from("profiles")
          .update({ student_since: new Date().toISOString() })
          .eq("id", userId)
          .is("student_since", null);
        if (profileError) throw profileError;
      }
    }
  } catch {
    // Release the claim so Stripe's retry can safely process the event again.
    await admin.from("stripe_webhook_events").delete().eq("event_id", event.id);
    return NextResponse.json({ error: "Falha ao processar evento." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
