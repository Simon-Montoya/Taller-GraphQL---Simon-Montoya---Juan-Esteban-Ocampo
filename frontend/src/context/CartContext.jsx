import { useState } from 'react';
import { CartContext } from './cart';
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [notice, setNotice] = useState('');
  function add(medication) {
    setItems(current => current.some(item => item.id === medication.id)
      ? current.map(item => item.id === medication.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { ...medication, quantity: 1 }]);
    setNotice(`${medication.name} added to your cart.`);
  }
  function change(id, delta) {
    setItems(current => current.map(item => item.id === id
      ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  }
  function remove(id) { setItems(current => current.filter(item => item.id !== id)); }
  function clear() { setItems([]); setNotice(''); }
  return <CartContext.Provider value={{ items, add, change, remove, clear,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) }}>
    {children}<div className="sr-only" role="status">{notice}</div>
  </CartContext.Provider>;
}

