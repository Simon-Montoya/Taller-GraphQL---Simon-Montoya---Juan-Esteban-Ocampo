import { supabase } from "../config/supabase.js";

export async function createOrderCommand(input) {
  const {
    items,
    prescriptionReference = null
  } = input;

  const { data, error } = await supabase.rpc(
    "create_order_transactional",
    {
      p_items: items,
      p_prescription_reference: prescriptionReference
    }
  );

  if (error) {
    console.error("CREATE ORDER RPC ERROR:", error);

    return {
      success: false,
      order: null,
      errors: [
        {
          code: "INTERNAL_ERROR",
          message: "The order could not be processed."
        }
      ]
    };
  }

  // La función PostgreSQL devolvió una regla de negocio inválida.
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

  // La transacción fue exitosa.
  // Ahora obtenemos la orden que acabamos de crear.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", data.orderId)
    .single();

  if (orderError) {
    console.error("FETCH CREATED ORDER ERROR:", orderError);

    return {
      success: false,
      order: null,
      errors: [
        {
          code: "ORDER_READ_ERROR",
          message: "The order was created but could not be retrieved."
        }
      ]
    };
  }

  // Recuperamos sus items.
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", data.orderId)
    .order("id", { ascending: true });

  if (itemsError) {
    console.error("FETCH ORDER ITEMS ERROR:", itemsError);

    return {
      success: false,
      order: null,
      errors: [
        {
          code: "ORDER_ITEMS_READ_ERROR",
          message: "The order was created but its items could not be retrieved."
        }
      ]
    };
  }

  return {
    success: true,

    order: {
      ...order,
      items: orderItems
    },

    errors: []
  };
}