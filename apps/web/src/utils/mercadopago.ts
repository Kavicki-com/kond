import { initMercadoPago } from '@mercadopago/sdk-react';

export const initializeMercadoPago = () => {
    initMercadoPago('TEST-b703b043-652f-4e46-8829-9e7367ee1cb1', {
        locale: 'pt-BR'
    });
};
