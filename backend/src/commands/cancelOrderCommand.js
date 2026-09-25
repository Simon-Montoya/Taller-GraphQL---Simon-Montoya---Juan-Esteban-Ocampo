import { supabase } from "../config/supabase.js";

export async function cancelOrderCommand(orderId) {
  const { data, error } = await supabase.rpc(
    "cancel_order",
    {
      p_order_id: orderId
    }
  );

  if (error) {
    console.error("CANCEL ORDER RPC ERROR:", error);

    return {
      success: false,
      order: null,
      errors: [
        {
          code: "INTERNAL_ERROR",
          message: "The order could not be cancelled."
        }
      ]
    };
  }

  if (!data.success) {
    return {
      success: false,
      order: null,
      errors: [
        {
          code: data.error.code,
          message: data.error.message
        }
      ]
    };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError) {
    return {
      success: false,
      order: null,
      errors: [
        {
          code: "ORDER_READ_ERROR",
          message: "The cancelled order could not be retrieved."
        }
      ]
    };
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("id", { ascending: true });

  if (itemsError) {
    return {
      success: false,
      order: null,
      errors: [
        {
          code: "ORDER_ITEMS_READ_ERROR",
          message: "The order items could not be retrieved."
        }
      ]
    };
  }

  return {
    success: true,

    order: {
      ...order,
      items: items ?? []
    },

    errors: []
  };
}