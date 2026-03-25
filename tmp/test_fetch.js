(async () => {
  const res = await fetch('https://nooggzakadyzgaaujjur.supabase.co/functions/v1/process-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentData: {
        transaction_amount: 100,
        description: 'test',
        payment_method_id: 'pix',
        payer: { email: 'comprador+teste333@gmail.com' }
      }
    })
  });
  console.log(res.status);
  console.log(await res.text());
})();
