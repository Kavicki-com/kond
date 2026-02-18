import { supabase } from '../lib/supabase';

export interface PaymentData {
    transaction_amount: number;
    token?: string;
    description?: string;
    installments?: number;
    payment_method_id?: string;
    issuer_id?: string;
    payment_method_option_id?: string;
    payment_type_id?: string;
    payer: {
        email: string;
        identification?: {
            type: string;
            number: string;
        };
        first_name?: string;
        last_name?: string;
    };
    [key: string]: any;
}

export const processPayment = async (paymentData: PaymentData, condominiumId?: string, userId?: string) => {
    const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { paymentData, condominiumId, userId },
    });

    if (error) {
        // Try to extract the real error message from the response body
        const context = (error as any).context;
        if (context) {
            try {
                const body = await context.json();
                throw new Error(body?.error || error.message);
            } catch {
                // If parsing fails, fall through
            }
        }
        throw new Error(error.message || 'Erro ao processar pagamento');
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data;
};
