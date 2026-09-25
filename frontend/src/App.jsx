import { useEffect, useRef, useState } from 'react';
import { CartProvider } from './context/CartContext';
import { useCart } from './hooks/useCart';
import CatalogPage from './pages/CatalogPage';
import MedicationPage from './pages/MedicationPage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import './App.css';
function readRoute() { return window.location.hash.slice(1) || '/'; }
function Application() {
  const [route, setRoute] = useState(readRoute);
  const [createdId, setCreatedId] = useState(null);
  const main = useRef(null);
  const { count } = useCart();
  useEffect(() => {
    const navigate = () => { setRoute(readRoute()); window.scrollTo(0, 0); main.current?.focus(); };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  const medication = route.match(/^\/medication\/(\d+)$/);
  const order = route.match(/^\/order(?:\/([^/]+))?$/);
  let orderId = null;
  try { orderId = order?.[1] ? decodeURIComponent(order[1]) : null; } catch { /* Invalid URL: show lookup. */ }
  return <><a className="skip-link" href="#main" onClick={event => { event.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <header className="site-header"><a className="brand" href="#/"><span className="brand-icon" aria-hidden="true">✚</span><span>Afirmative<span className="brand-light"> Pill</span></span></a>
      <nav aria-label="Main navigation"><a aria-current={route === '/' || medication ? 'page' : undefined} href="#/">Catalog</a><a aria-current={order ? 'page' : undefined} href="#/order">Track order</a><a className="cart-link" aria-current={route === '/cart' ? 'page' : undefined} href="#/cart">Cart <span>{count}</span></a></nav>
    </header>
    <main id="main" ref={main} tabIndex={-1}>
      {route === '/' ? <CatalogPage /> : route === '/cart' ? <CartPage onCreated={id => { setCreatedId(id); window.location.hash = `/order/${encodeURIComponent(id)}`; }} /> :
        medication && Number.isSafeInteger(Number(medication[1])) && Number(medication[1]) <= 2147483647 ? <MedicationPage key={medication[1]} id={Number(medication[1])} /> :
        order ? <OrderPage key={orderId || 'lookup'} id={orderId} created={!!orderId && orderId === createdId} /> : <p className="state">Page not found. <a href="#/">Return to catalog</a></p>}
    </main><footer><strong>Afirmative Pill</strong><span>Thoughtful care. Every step of the way.</span></footer>
  </>;
}
export default function App() { return <CartProvider><Application /></CartProvider>; }
