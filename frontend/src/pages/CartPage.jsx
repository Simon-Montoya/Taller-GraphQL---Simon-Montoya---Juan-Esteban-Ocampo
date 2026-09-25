import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_ORDER, ORDER } from '../graphql/operations';
import { useCart } from '../hooks/useCart';
import { Errors, PrescriptionBadge } from '../components/Feedback';
import { money } from '../lib/format';
export default function CartPage({ onCreated }) {
  const { items, change, remove, clear, total } = useCart();
  const [reference, setReference] = useState('');
  const [errors, setErrors] = useState([]);
  const submitting = useRef(false);
  const [createOrder, { loading, error }] = useMutation(CREATE_ORDER, {
    update(cache, { data }) {
      if (data?.createOrder.success && data.createOrder.order) {
        cache.writeQuery({ query: ORDER, variables: { id: data.createOrder.order.id }, data: { order: data.createOrder.order } });
      }
    },
  });
  const requiresPrescription = items.some(item => item.requiresPrescription);
  async function checkout(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setErrors([]);
    try {
      const { data } = await createOrder({ variables: { input: {
        items: items.map(item => ({ medicationId: item.id, quantity: item.quantity })),
        prescriptionReference: requiresPrescription ? reference.trim() : null,
      } } });
      const payload = data?.createOrder;
      if (payload?.success && payload.order) { clear(); onCreated(payload.order.id); }
      else setErrors(payload?.errors.length ? payload.errors : [{ code: 'ORDER_FAILED', message: 'The order could not be created.' }]);
    } catch { /* Apollo exposes transport and GraphQL errors below. */ }
    finally { submitting.current = false; }
  }
  return <><span className="eyebrow">YOUR SELECTION</span><h1>Shopping cart</h1>
    {!items.length ? <div className="panel state"><h2>Your cart is empty</h2><p>Explore the pharmacy to add your medications.</p><a className="button" href="#/">Browse catalog</a></div> :
      <form onSubmit={checkout}><fieldset disabled={loading} className="checkout-grid">
        <section className="panel"><div className="section-heading"><h2>Medications</h2><button className="text-button" type="button" onClick={clear}>Clear cart</button></div>
          {items.map(item => <article className="cart-row" key={item.id}><div><h3><a href={`#/medication/${item.id}`}>{item.name}</a></h3><p className="muted">{item.presentation}</p><PrescriptionBadge required={item.requiresPrescription} /><p>{money(item.price)} each</p></div>
            <div className="cart-controls"><div className="quantity"><button type="button" className="secondary" aria-label={`Decrease ${item.name}`} disabled={item.quantity === 1} onClick={() => change(item.id, -1)}>−</button><output aria-label={`Quantity of ${item.name}`}>{item.quantity}</output><button type="button" className="secondary" aria-label={`Increase ${item.name}`} onClick={() => change(item.id, 1)}>+</button></div>
              <strong>{money(item.price * item.quantity)}</strong><button type="button" className="text-button" onClick={() => remove(item.id)}>Remove</button></div>
          </article>)}
        </section>
        <aside className="panel summary"><h2>Order summary</h2><div className="section-heading"><span>Estimated total</span><strong className="price">{money(total)}</strong></div>
          <p className="muted">Availability and the final total are confirmed when your order is placed.</p>
          {requiresPrescription && <div className="prescription-note"><label htmlFor="reference">Prescription reference <span aria-hidden="true">*</span></label><p>A prescription is required for one or more medications. Enter its reference for review before dispatch.</p><input id="reference" required value={reference} onChange={event => setReference(event.target.value)} placeholder="Prescription reference" /></div>}
          <Errors errors={errors} error={error} />
          <button className="full-width" disabled={loading || (requiresPrescription && !reference.trim())}>{loading ? 'Placing order…' : 'Place order'}</button>
        </aside>
      </fieldset></form>}
  </>;
}
