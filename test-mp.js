const SUPABASE_URL = 'https://nooggzakadyzgaaujjur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vb2dnemFrYWR5emdhYXVqanVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzI0NTgsImV4cCI6MjA4NjMwODQ1OH0.GIRTFizlwJs-8J4M2QretTT38WCiDm2yD9aDCJ1X8gA';

async function testPayment() {
    const paymentData = {
        transaction_amount: 199,
        payment_method_id: 'visa',
        token: 'dummy_token',
        installments: 1,
        payer: {
            email: 'test_user_123@testuser.com',
            first_name: 'Test',
            last_name: 'User',
            identification: {
                type: 'CPF',
                number: '19119119100'
            }
        }
    };

    const res = await fetch(`${SUPABASE_URL}/functions/v1/process-payment`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            paymentData,
            condominiumId: 'test-condo-id',
            userId: 'test-user-id'
        })
    });

    const data = await res.json();
    console.log('Response:', data);
}

testPayment();
