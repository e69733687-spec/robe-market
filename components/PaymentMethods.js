import React, { useState } from 'react';

const paymentGateways = [
  { name: 'Telebirr', logo: '/payments/telebirr.png' },
  { name: 'Chapa', logo: '/payments/chapa.png' },
  { name: 'CBE Birr', logo: '/payments/cbe-birr.png' },
  { name: 'Awash', logo: '/payments/awash.png' },
  { name: 'M-Pesa', logo: '/payments/mpesa.png' },
];

export default function PaymentMethods({ total, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePayment = async (gateway) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment: gateway, total }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccess(data.message);
        if (onPaymentSuccess) onPaymentSuccess(gateway);
      } else {
        setError(data.error || 'Payment failed.');
      }
    } catch (err) {
      setError('Payment error.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-slate-900 mb-2">Choose Payment Method</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {paymentGateways.map((gateway) => (
          <button
            key={gateway.name}
            onClick={() => handlePayment(gateway.name)}
            className="flex flex-col items-center justify-center rounded-xl border border-slate-300 bg-white p-4 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            disabled={loading}
          >
            <img src={gateway.logo} alt={gateway.name} className="h-10 mb-2" />
            <span className="font-medium text-slate-800">{gateway.name}</span>
          </button>
        ))}
      </div>
      {loading && <div className="text-emerald-500">Processing payment...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-emerald-600">{success}</div>}
    </div>
  );
}
