import {
  getMedications,
  getMedicationById
} from "../queries/medicationQueries.js";

import { createOrderCommand } from "../commands/createOrderCommand.js";
import { getOrderProjectionById } from "../queries/orderQueries.js";
import {
  validatePrescriptionCommand
} from "../commands/validatePrescriptionCommand.js";

import {
  dispatchOrderCommand
} from "../commands/dispatchOrderCommand.js";

import {
  cancelOrderCommand
} from "../commands/cancelOrderCommand.js";

import {
  pubsub,
  ORDER_STATUS_CHANGED
} from "../pubsub/pubsub.js";

export const resolvers = {
  Query: {
    hello: () => "Afirmative Pill GraphQL API",
    order: async (_, { id }) => {
      return await getOrderProjectionById(id);
    },

    medications: async (_, { search }) => {
      return await getMedications(search);
    },

    medication: async (_, { id }) => {
      return await getMedicationById(id);
    }
  },

Mutation: {
        createOrder: async (_, { input }) => {
            return await createOrderCommand(input);
        },

        validatePrescription: async (_, { orderId }) => {
        const result =
            await validatePrescriptionCommand(orderId);

        if (result.success && result.order) {
            await pubsub.publish(ORDER_STATUS_CHANGED, {
            orderStatusChanged: result.order
            });
        }

        return result;
        },

        dispatchOrder: async (_, { orderId }) => {
        const result =
            await dispatchOrderCommand(orderId);

        if (result.success && result.order) {
            await pubsub.publish(ORDER_STATUS_CHANGED, {
            orderStatusChanged: result.order
            });
        }

        return result;
        },

        cancelOrder: async (_, { orderId }) => {
        const result =
            await cancelOrderCommand(orderId);

        if (result.success && result.order) {
            await pubsub.publish(ORDER_STATUS_CHANGED, {
            orderStatusChanged: result.order
            });
        }

        return result;
        },
},

Subscription: {
  orderStatusChanged: {
    subscribe: async function* (_, { orderId }) {
      const iterator = pubsub.asyncIterableIterator(
        ORDER_STATUS_CHANGED
      );

      for await (const payload of iterator) {
        if (
          payload.orderStatusChanged.id === orderId
        ) {
          yield payload;
        }
      }
    }
  }
},

  Medication: {
    activeIngredient: (medication) =>
      medication.active_ingredient,

    requiresPrescription: (medication) =>
      medication.requires_prescription
  },

  Order: {
    prescriptionReference: (order) =>
      order.prescription_reference,

    prescriptionVerified: (order) =>
      order.prescription_verified,

    createdAt: (order) =>
      order.created_at
  },

    OrderItem: {
        medicationId: (item) =>
            item.medication_id,

        unitPrice: (item) =>
            item.unit_price,

        medication: async (item, _, context) => {
            return await context.loaders.medication.load(
            item.medication_id
            );
        }
    }

    
};