import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { paymentData, condominiumId: condoIdFromClient, userId } = await req.json();

    if (!paymentData) {
      return new Response(
        JSON.stringify({ error: 'paymentData is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!paymentData.description) {
      paymentData.description = 'Assinatura Kond';
    }

    // Force the webhook URL to guarantee Mercado Pago sends notifications
    paymentData.notification_url = 'https://nooggzakadyzgaaujjur.supabase.co/functions/v1/mp-webhook';

    const ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Payment provider not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Look up condominium_id server-side using service_role (bypasses RLS)
    let condominiumId = condoIdFromClient;
    if (!condominiumId && userId) {
      const { data: staffData } = await supabase
        .from('staff')
        .select('condominium_id')
        .eq('profile_id', userId)
        .single();
      condominiumId = staffData?.condominium_id;
    }

    // Call Mercado Pago API
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(paymentData),
    });

    const mpResult = await mpResponse.json();
    console.log('MP status:', mpResult.status, '| detail:', mpResult.status_detail, '| id:', mpResult.id);

    if (!mpResponse.ok || mpResult.status === 'rejected') {
      const detail = mpResult.status_detail || mpResult.message || 'Payment rejected';
      return new Response(
        JSON.stringify({ error: detail, mpStatus: mpResult.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only activate subscription when payment is confirmed (approved)
    // pending/in_process = boleto or pix waiting — keep as trialing, webhook will activate later
    if (condominiumId) {
      if (mpResult.status === 'approved') {
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            external_subscription_id: String(mpResult.id),
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('condominium_id', condominiumId);
      } else {
        // pending/in_process: save the payment ID so webhook can find it later
        await supabase
          .from('subscriptions')
          .update({
            external_subscription_id: String(mpResult.id),
            updated_at: new Date().toISOString(),
          })
          .eq('condominium_id', condominiumId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: mpResult.id,
        status: mpResult.status,
        statusDetail: mpResult.status_detail,
        qrCodeBase64: mpResult.point_of_interaction?.transaction_data?.qr_code_base64,
        qrCodeString: mpResult.point_of_interaction?.transaction_data?.qr_code,
        ticketUrl: mpResult.point_of_interaction?.transaction_data?.ticket_url,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('process-payment error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
