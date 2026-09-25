import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client/react';
import { ORDER, ORDER_STATUS_CHANGED, VALIDATE_PRESCRIPTION, DISPATCH_ORDER, CANCEL_ORDER } from '../graphql/operations';
import { Errors, Loading, StatusBadge } from '../components/Feedback';
import { money } from '../lib/format';
import { getConnectionStatus, subscribeToConnection } from '../lib/apolloClient';
export default function OrderPage({ id, created }) {
  const [lookup, setLookup] = useState(id || '');
  return <><span className="eyebrow">FROM PHARMACY TO YOU</span><h1>Track your order</h1>
    <form className="lookup panel" onSubmit={event => { event.preventDefault(); if (lookup.trim()) window.location.hash = `/order/${encodeURIComponent(lookup.trim())}`; }}>
      <label htmlFor="order-id">Order ID</label><div className="search-row"><input id="order-id" required value={lookup} onChange={event => setLookup(event.target.value)} placeholder="Enter your order ID" /><button disabled={!lookup.trim()}>Find order</button></div>
    </form>
    {created && <p className="success" role="status">Order placed successfully. Your cart has been cleared. Save this order ID to track it later.</p>}
    {id ? <OrderDetails key={id} id={id} /> : <p className="state">Enter an order ID to see its status and medications.</p>}
  </>;
}
function OrderDetails({ id }) {
  const { data, loading, error, refetch } = useQuery(ORDER, { variables: { id }, fetchPolicy: 'cache-and-network', notifyOnNetworkStatusChange: true });
  const connection = useSyncExternalStore(subscribeToConnection, getConnectionStatus);
  const { error: subscriptionError, restart } = useSubscription(ORDER_STATUS_CHANGED, {
    variables: { orderId: id },
    skip: !data?.order,
    onData({ client, data: event }) {
      const changed = event.data?.orderStatusChanged;
      if (!changed || changed.id !== id) return;
      // Merge the header, retaining the nested items loaded by TrackOrder.
      client.cache.updateQuery({ query: ORDER, variables: { id } }, current =>
        current?.order ? { ...current, order: { ...current.order, ...changed } } : current,
      );
    },
  });
  const previousConnection = useRef(connection);
  useEffect(() => {
    // Catch up after connecting/reconnecting: WebSocket events are not replayed.
    if (connection === 'connected' && previousConnection.current !== 'connected') {
      void refetch().catch(() => { /* The existing query error state handles this. */ });
    }
    previousConnection.current = connection;
  }, [connection, refetch]);
  // useSubscription cleans up on unmount/ID changes; the shared lazy client closes
  // its socket when the last subscription is removed.
  const [validate, validation] = useMutation(VALIDATE_PRESCRIPTION);
  const [dispatch, dispatching] = useMutation(DISPATCH_ORDER);
  const [cancel, cancelling] = useMutation(CANCEL_ORDER);
  const [errors, setErrors] = useState([]);
  const [commandError, setCommandError] = useState(null);
  const [notice, setNotice] = useState('');
  const acting = useRef(false);
  const busy = validation.loading || dispatching.loading || cancelling.loading;
  async function run(mutation, field) {
    if (acting.current) return;
    acting.current = true;
    setErrors([]); setCommandError(null); setNotice('');
    try {
      const result = await mutation({ variables: { orderId: id } });
      const payload = result.data?.[field];
      if (payload?.success) setNotice('Order updated successfully.');
      else setErrors(payload?.errors.length ? payload.errors : [{ code: 'COMMAND_FAILED', message: 'The order could not be updated.' }]);
      // Returned OrderFields update normalized entities immediately. Re-read even on
      // domain failure so actions also reflect concurrent changes on the server.
      await refetch();
    } catch (failure) { setCommandError(failure); }
    finally { acting.current = false; }
  }
  if (loading && !data) return <Loading>Loading order…</Loading>;
  if (error) return <><Errors error={error} /><button onClick={() => refetch()}>Try again</button></>;
  const order = data?.order;
  if (!order) return <p className="state">No order found for this ID.</p>;
  return <article className="panel order"><div className="section-heading"><div><h2>Order details</h2><p className="order-id">{order.id}</p></div><StatusBadge status={order.status} /></div>
    <p className="muted" role="status" aria-live="polite">
      {subscriptionError ? 'Live updates unavailable. You can still refresh the status.' :
        connection === 'connected' ? 'Live updates active' :
        connection === 'connecting' ? 'Connecting live updates...' : 'Live updates disconnected. Reconnecting...'}
      {subscriptionError && <> <button className="text-button" onClick={() => restart()}>Retry live updates</button></>}
    </p>
    <dl className="detail-grid"><div><dt>Prescription reference</dt><dd>{order.prescriptionReference || 'Not provided'}</dd></div><div><dt>Prescription verified</dt><dd>{order.prescriptionVerified ? 'Yes' : 'No'}</dd></div><div><dt>Created</dt><dd>{order.createdAt}</dd></div></dl>
    <h3>Medications</h3>
    {order.items.map(item => <div className="order-item" key={item.id}><div><a href={`#/medication/${item.medicationId}`}>{item.medication.name}</a><p className="muted">{item.medication.presentation}</p><p className="muted">{item.medication.requiresPrescription ? 'Prescription required' : 'No prescription required'}</p></div><div>{item.quantity} × {money(item.unitPrice)}<br /><strong>{money(item.quantity * item.unitPrice)}</strong></div></div>)}
    <div className="section-heading order-total"><h3>Total</h3><strong className="price">{money(order.total)}</strong></div>
    <Errors errors={errors} error={commandError} />{notice && <p className="success" role="status">{notice}</p>}
    <div className="section-heading"><div><h3>Workshop controls</h3><p className="muted">Manage the order through its available steps.</p></div><button className="secondary" disabled={busy || loading} onClick={() => refetch()}>Refresh status</button></div>
    <div className="actions">
      {order.status === 'PENDING_APPROVAL' && <button disabled={busy || loading} onClick={() => run(validate, 'validatePrescription')}>Validate prescription</button>}
      {order.status === 'APPROVED' && <button disabled={busy || loading} onClick={() => run(dispatch, 'dispatchOrder')}>Dispatch order</button>}
      {['PENDING_APPROVAL', 'APPROVED'].includes(order.status) && <button className="danger" disabled={busy || loading} onClick={() => run(cancel, 'cancelOrder')}>Cancel order</button>}
      {['DISPATCHED', 'CANCELLED'].includes(order.status) && <p className="muted">This order is final. No further changes are available.</p>}
      {(busy || loading) && <span role="status">Updating…</span>}
    </div>
  </article>;
}

