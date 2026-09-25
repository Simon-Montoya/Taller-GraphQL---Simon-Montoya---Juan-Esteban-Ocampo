import { useQuery } from '@apollo/client/react';
import { MEDICATION_DETAIL } from '../graphql/operations';
import { useCart } from '../hooks/useCart';
import { Errors, Loading, PrescriptionBadge } from '../components/Feedback';
import { money } from '../lib/format';
export default function MedicationPage({ id }) {
  const { data, loading, error, refetch } = useQuery(MEDICATION_DETAIL, { variables: { id }, fetchPolicy: 'network-only' });
  const { add } = useCart();
  if (loading) return <Loading>Loading medication details…</Loading>;
  if (error) return <><Errors error={error} /><button onClick={() => refetch()}>Try again</button></>;
  const medication = data?.medication;
  if (!medication) return <p className="state">Medication not found. <a href="#/">Return to catalog</a></p>;
  return <><a className="text-link" href="#/">← Back to catalog</a>
    <article className="panel detail"><span className="eyebrow">MEDICATION DETAILS</span>
      <h1>{medication.name}</h1><PrescriptionBadge required={medication.requiresPrescription} />
      <p className="description">{medication.description}</p>
      <dl className="detail-grid">{[
        ['Active ingredient', medication.activeIngredient], ['Category', medication.category],
        ['Dosage', medication.dosage], ['Presentation', medication.presentation],
        ['Manufacturer', medication.manufacturer], ['SKU', medication.sku], ['Stock', medication.stock],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="section-heading"><strong className="price">{money(medication.price)}</strong>
        <button disabled={medication.stock < 1} onClick={() => add(medication)}>{medication.stock < 1 ? 'Out of stock' : 'Add to cart'}</button></div>
    </article></>;
}
