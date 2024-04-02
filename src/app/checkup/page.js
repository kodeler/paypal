"use client"
import React, { useState, useRef } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';

export default function CheckoutForm() {
    const [message, setMessage] = useState('');
    const amountRef = useRef(null); // Referencia para el monto de la orden

    const paypalCreateOrder = async () => {
        try {
            let response = await axios.post('/api/paypal/create-order', {
                user_id: 'user123', // Asumiendo un ID de usuario estático; ajusta según sea necesario
                order_price: amountRef.current.value, // Usando el valor del input referenciado
            });
            return response.data.data.order.order_id;
        } catch (err) {
            setMessage('Error al crear la orden.');
            return null;
        }
    };

    const paypalCaptureOrder = async (orderID) => {
        try {
            let response = await axios.post('/api/paypal/capture-order', {
                orderID,
            });
            if (response.data.success) {
                setMessage('Orden capturada exitosamente.');
            } else {
                setMessage('La captura de la orden falló.');
            }
        } catch (err) {
            setMessage('Error al capturar la orden.');
        }
    };

    return (
        <div>
            {message && <div className="text-center my-4">{message}</div>}

            {/* Agregando el input para el monto de la orden */}
            <div className="text-center mb-4">
                <label htmlFor="orderAmount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Monto de la Orden</label>
                <input type="number" id="orderAmount" ref={amountRef} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Monto en USD" required />
            </div>

            <PayPalScriptProvider
                options={{
                    'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                    currency: 'USD',
                    intent: 'capture',
                }}
            >
                <div className="flex justify-center">
                    <PayPalButtons
                        style={{ color: 'gold', shape: 'rect', label: 'pay', height: 50 }}
                        createOrder={async (data, actions) => {
                            let order_id = await paypalCreateOrder();
                            return order_id ? order_id.toString() : false;
                        }}
                        onApprove={async (data, actions) => {
                            await paypalCaptureOrder(data.orderID);
                        }}
                    />
                </div>
            </PayPalScriptProvider>
        </div>
    );
}
