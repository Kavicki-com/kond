import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Configured to handle OPTIONS requests for CORS (often required by webhooks)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Webhook data might come as JSON in body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      // If not JSON, it might just be query params
      body = {};
    }

    // MercadoPago webhooks can send data['id'] or data.id in the body, or data.id in URL params.
    const paymentId = body?.data?.id || body?.id || url.searchParams.get('data.id') || url.searchParams.get('id');
    const topic = body?.type || url.searchParams.get('topic') || url.searchParams.get('type');
    const action = body?.action || url.searchParams.get('action');

    console.log(`Received webhook: topic=${topic}, action=${action}, paymentId=${paymentId}`);

    // We only care about payment updates
    if ((topic === 'payment' || action?.includes('payment')) && paymentId) {
      const ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      if (!ACCESS_TOKEN) {
        console.error('MERCADOPAGO_ACCESS_TOKEN not configured.');
        return new Response('Not configured', { status: 500 });
      }

      // 1. Fetch payment details from MercadoPago
      console.log(`Fetching payment details for ID: ${paymentId}`);
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      });

      if (!mpResponse.ok) {
        console.error(`Failed to fetch payment ${paymentId} from MercadoPago:`, await mpResponse.text());
        return new Response('Failed to fetch payment', { status: 400 });
      }

      const paymentData = await mpResponse.json();
      console.log(`Payment status for ${paymentId}: ${paymentData.status}`);

      // 2. If payment is approved, activate the subscription
      if (paymentData.status === 'approved') {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Find the subscription that corresponds to this payment ID
        const { data: subscription, error: fetchError } = await supabase
          .from('subscriptions')
          .select('id, status')
          .eq('external_subscription_id', String(paymentId))
          .single();

        if (fetchError) {
          console.error(`Could not find subscription for payment ${paymentId}:`, fetchError);
          return new Response('Subscription not found', { status: 404 });
        }

        // Only update if it's not already active
        if (subscription && subscription.status !== 'active') {
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1); // Add 1 month

          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_end: periodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          if (updateError) {
            console.error('Error updating subscription:', updateError);
            return new Response('Error updating subscription', { status: 500 });
          }

          console.log(`Subscription ${subscription.id} activated successfully via Webhook.`);
        } else {
          console.log(`Subscription for payment ${paymentId} is already active or missing.`);
        }
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error('mp-webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
