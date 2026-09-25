import { useContext } from 'react';
import { CartContext } from '../context/cart';
export function useCart() { return useContext(CartContext); }
