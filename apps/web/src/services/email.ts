import emailjs from '@emailjs/browser';

// EmailJS Credentials
const SERVICE_ID = 'service_c57rm9y';
const TEMPLATE_ID = 'kond-boasvindas';
const PUBLIC_KEY = 'hMLKX6IzN3SvJM-DV';

export interface EmailParams {
    to_email: string;
    to_name: string;
    condo_name: string;
    plan_name: string;
    link_painel: string;
}

export const sendWelcomeEmail = async (params: EmailParams) => {
    try {
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            {
                ...params,
            } as Record<string, unknown>,
            PUBLIC_KEY
        );

        console.log('Email sent successfully!', response.status, response.text);
        return response;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};
