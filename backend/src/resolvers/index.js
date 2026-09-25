import {
  getMedications,
  getMedicationById
} from "../queries/medicationQueries.js";

import { createOrderCommand } from "../commands/createOrderCommand.js";
import { getOrderProjectionById } from "../queries/orderQueries.js";
import {
  validatePrescriptionCommand
} from "../commands/validatePrescriptionCommand.js";

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
            return await validatePrescriptionCommand(orderId);
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