export const typeDefs = `#graphql

  type Medication {
    id: Int!
    sku: String!
    name: String!
    activeIngredient: String!
    category: String!
    dosage: String!
    presentation: String!
    price: Int!
    stock: Int!
    requiresPrescription: Boolean!
    manufacturer: String!
    description: String!
  }

  type Query {
    hello: String!
    medications(search: String): [Medication!]!
    medication(id: Int!): Medication
  }
`;