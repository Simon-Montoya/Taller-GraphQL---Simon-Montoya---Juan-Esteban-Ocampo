import { supabase } from "../config/supabase.js";

export async function validatePrescriptionCommand(orderId) {
  const { data, error } = await supabase.rpc(
    "validate_order_prescription",
    {
      p_order_id: orderId
    }
  );

  if (error) {
    console.error("VALIDATE PRESCRIPTION RPC ERROR:", error);

    return {
      success: false,
      order: null,
      errors: [
        {
          code: "INTERNAL_ERROR",
          message: "The prescription could not be validated."
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
    console.error(
      "FETCH VALIDATED ORDER ERROR:",
      orderError
    );

    return {
      success: false,
      order: null,
      errors: [
        {
          code: "ORDER_READ_ERROR",
          message:
            "The prescription was validated but the order could not be retrieved."
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
          message:
            "The order items could not be retrieved."
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