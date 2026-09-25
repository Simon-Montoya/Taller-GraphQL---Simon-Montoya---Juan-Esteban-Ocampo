import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { CATALOG } from '../graphql/operations';
import { useDebounce } from '../hooks/useDebounce';
import { useCart } from '../hooks/useCart';
import { Errors, Loading, PrescriptionBadge } from '../components/Feedback';
import { money } from '../lib/format';
export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const term = useDebounce(search.trim());
  const { data, loading, error, refetch } = useQuery(CATALOG, { variables: { search: term || null }, notifyOnNetworkStatusChange: true });
  const { add } = useCart();
  return <>
    <section className="hero"><span className="eyebrow">CARE, MADE SIMPLE</span>
      <h1>Your health.<br /><span>Our everyday priority.</span></h1>
      <p>Explore medications, review their details, and manage your order in one place.</p>
    </section>
    <section aria-labelledby="catalog-heading">
      <div className="section-heading"><div><span className="eyebrow">OUR PHARMACY</span><h2 id="catalog-heading">Medication catalog</h2></div>
        <a className="text-link" href="#/cart">View your cart →</a></div>
      <label className="search-label" htmlFor="search">Search by name, active ingredient, or category</label>
      <input id="search" type="search" className="search" placeholder="Search medications…" value={search} onChange={event => setSearch(event.target.value)} />
      {loading || term !== search.trim() ? <Loading>Searching the pharmacy…</Loading> : error ? <><Errors error={error} /><button onClick={() => refetch()}>Try again</button></> :
        data?.medications.length ? <><p className="muted results" role="status">{data.medications.length} medications found</p>
          <div className="catalog-grid">{data.medications.map(medication => <article className="medication-card" key={medication.id}>
            <div className="card-symbol" aria-hidden="true">✚</div>
            <PrescriptionBadge required={medication.requiresPrescription} />
            <h3><a href={`#/medication/${medication.id}`}>{medication.name}</a></h3>
            <p className="muted">{medication.presentation}</p>
            <strong className="price">{money(medication.price)}</strong>
            <div className="card-actions"><a className="button secondary" href={`#/medication/${medication.id}`}>View details</a><button onClick={() => add(medication)}>Add to cart</button></div>
          </article>)}</div></> : <p className="state">No medications found. Try a different search.</p>}
    </section>
  </>;
}
