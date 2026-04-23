const store = require('../../lib/store');
const { sendTransactionConfirmation } = require('../../lib/email');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { payment, total, productId, buyerEmail } = req.body;
  if (!payment || !total || !productId || !buyerEmail) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  const product = store.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  try {
    let paymentResponse;
    if (payment === 'Chapa') {
      // Chapa API integration
      const chapaResponse = await fetch('https://api.chapa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: total,
          currency: 'ETB',
          email: buyerEmail,
          first_name: 'Buyer',
          last_name: 'Name',
          tx_ref: `txn-${Date.now()}`,
          callback_url: `${process.env.NEXT_PUBLIC_API_URL}/api/payment/callback`,
          return_url: `${process.env.NEXT_PUBLIC_API_URL}/success`
        })
      });
      paymentResponse = await chapaResponse.json();
      if (paymentResponse.status === 'success') {
        store.analytics.successfulPayments += 1;
        await sendTransactionConfirmation(buyerEmail, 'seller@robemarket.com', product.name, total);
        return res.status(200).json({ status: 'success', checkout_url: paymentResponse.data.checkout_url });
      }
    } else if (payment === 'Telebirr') {
      // Telebirr API integration (simulated)
      const telebirrResponse = await fetch('https://api.telebirr.com/payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TELEBIRR_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: total,
          phone: '251900000000', // buyer's phone
          product: product.name
        })
      });
      paymentResponse = await telebirrResponse.json();
      if (paymentResponse.success) {
        store.analytics.successfulPayments += 1;
        await sendTransactionConfirmation(buyerEmail, 'seller@robemarket.com', product.name, total);
        return res.status(200).json({ status: 'success', message: 'Telebirr payment initiated' });
      }
    } else if (payment === 'Cash on Delivery') {
      store.analytics.successfulPayments += 1;
      await sendTransactionConfirmation(buyerEmail, 'seller@robemarket.com', product.name, total);
      return res.status(200).json({ status: 'success', message: 'CoD selected. Please pay on delivery.' });
    }

    return res.status(400).json({ error: 'Payment failed' });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
