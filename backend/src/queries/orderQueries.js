import { supabase } from "../config/supabase.js";

export async function getOrderProjectionById(id) {
  // Obtenemos la cabecera de la orden
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    throw new Error(
      `Error fetching order: ${orderError.message}`
    );
  }

  if (!order) {
    return null;
  }

  // Obtenemos los items asociados a la orden
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("id", { ascending: true });

  if (itemsError) {
    throw new Error(
      `Error fetching order items: ${itemsError.message}`
    );
  }

  return {
    ...order,
    items: items ?? []
  };
}