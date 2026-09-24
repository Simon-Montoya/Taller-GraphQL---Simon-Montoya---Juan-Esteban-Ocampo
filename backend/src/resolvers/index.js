import {
  getMedications,
  getMedicationById
} from "../queries/medicationQueries.js";

export const resolvers = {
  Query: {
    hello: () => "Afirmative Pill GraphQL API",

    medications: async (_, { search }) => {
      return await getMedications(search);
    },

    medication: async (_, { id }) => {
      return await getMedicationById(id);
    }
  },

  Medication: {
    activeIngredient: (medication) => medication.active_ingredient,

    requiresPrescription: (medication) =>
      medication.requires_prescription
  }
};