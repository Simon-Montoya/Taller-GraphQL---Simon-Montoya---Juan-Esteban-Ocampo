const guidance = {
  PRESCRIPTION_REQUIRED: 'Enter a prescription reference for the medications in this order.',
  INSUFFICIENT_STOCK: 'Review the quantities in your cart and try again.',
  MEDICATION_NOT_FOUND: 'Remove the unavailable medication from your cart.',
};
export function Errors({ errors = [], error }) {
  if (!error && !errors.length) return null;
  return <div className="error" role="alert">
    {error && <p>{error.message}</p>}
    {errors.map((entry, index) => <p key={`${entry.code}-${index}`}>
      <strong>{entry.code}</strong>: {entry.message}
      {guidance[entry.code] && <span className="error-help">{guidance[entry.code]}</span>}
    </p>)}
  </div>;
}
export function Loading({ children = 'Loading…' }) {
  return <p className="state" role="status">{children}</p>;
}
export function PrescriptionBadge({ required }) {
  return <span className={`badge ${required ? 'pending' : 'neutral'}`}>
    {required ? 'Prescription required' : 'No prescription required'}
  </span>;
}
const statuses = {
  PENDING_APPROVAL: ['pending', 'Pending approval'],
  APPROVED: ['approved', 'Approved'],
  DISPATCHED: ['dispatched', 'Dispatched'],
  CANCELLED: ['cancelled', 'Cancelled'],
};
export function StatusBadge({ status }) {
  const [color, label] = statuses[status] || ['neutral', status];
  return <span className={`badge ${color}`}>{label}</span>;
}
