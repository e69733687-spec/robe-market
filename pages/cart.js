
import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import PaymentMethods from '../components/PaymentMethods';

export default function CartPage() {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState('Cash on Delivery');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('robe-cart') || '[]');
    setCart(stored);
  }, []);

  const total = useMemo(() => cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0), [cart]);

  const updateQuantity = (id, qty) => {
    const next = cart.map((item) => (item.id === id ? { ...item, quantity: qty } : item));
    setCart(next);
    localStorage.setItem('robe-cart', JSON.stringify(next));
  };

  const handleCheckout = async () => {
    if (!session) {
      signIn();
      return;
    }

    if (!address.trim()) {
      setMessage('Please enter your delivery address.');
      return;
    }
    if (!payment) {
      setMessage('Please select a payment method.');
      return;
    }
    if (payment !== 'Cash on Delivery') {
      const paymentRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment, total })
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) {
        setMessage(paymentData.error || 'Payment failed.');
        return;
      }
    }

    const normalizedCart = cart.map((item) => ({
      productId: item.productId || item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: normalizedCart, payment, address })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Order received. ${data.message}`);
      localStorage.removeItem('robe-cart');
      setCart([]);
    } else {
      setMessage(data.error || 'Unable to place order.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Shopping cart</h1>
        <p className="mt-2 text-slate-600">Review your products and choose a payment option that works best for you.</p>
      </section>

      {status === 'loading' ? (
        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-8 text-center text-slate-500">Checking your session...</div>
      ) : !session ? (
        <div className="rounded-3xl bg-blue-50 border border-blue-200 p-8 text-center text-blue-700">
          <p className="text-lg font-semibold">Sign in to complete your order.</p>
          <button
            onClick={() => signIn()}
            className="mt-4 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Sign in now
          </button>
        </div>
      ) : null}

      {message && (
        <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">{message}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center text-slate-500">Your cart is empty.</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="h-24 w-24 rounded-3xl object-cover" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                    <p className="text-slate-500">{item.category}</p>
                    <p className="mt-2 text-slate-700 font-semibold">{item.price?.toLocaleString()} ETB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="rounded-2xl bg-slate-100 px-3 py-2">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded-2xl bg-slate-100 px-3 py-2">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Order summary</h2>
            <p className="mt-1 text-slate-500">Enter your delivery location and select a payment method.</p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Delivery location</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3"
              rows="4"
              placeholder="Enter your address in Robe"
            />
          </div>
          <div className="space-y-3">
            <PaymentMethods total={total} onPaymentSuccess={setPayment} />
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">
            <p className="text-sm">Total</p>
            <p className="mt-2 text-2xl font-semibold">{total.toLocaleString()} ETB</p>
          </div>
          <button onClick={handleCheckout} className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white text-sm font-semibold">
            Place order
          </button>
        </aside>
      </div>
    </div>
  );
}
