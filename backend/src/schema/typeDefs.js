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

    enum OrderStatus {
    PENDING_APPROVAL
    APPROVED
    DISPATCHED
    CANCELLED
    }

    type OrderItem {
    id: ID!
    medicationId: Int!
    quantity: Int!
    unitPrice: Int!
    medication: Medication!
    }

    type Order {
    id: ID!
    status: OrderStatus!
    total: Int!
    prescriptionReference: String
    prescriptionVerified: Boolean!
    createdAt: String!
    items: [OrderItem!]!
    }

    input OrderItemInput {
    medicationId: Int!
    quantity: Int!
    }

    input CreateOrderInput {
    items: [OrderItemInput!]!
    prescriptionReference: String
    }

    type MutationError {
    code: String!
    message: String!
    }

    type CreateOrderPayload {
    success: Boolean!
    order: Order
    errors: [MutationError!]!
    }

    type Query {
        hello: String!
        medications(search: String): [Medication!]!
        medication(id: Int!): Medication
        order(id: ID!): Order
    }

    type OrderCommandPayload {
    success: Boolean!
    order: Order
    errors: [MutationError!]!
    }

    type Mutation {
        createOrder(input: CreateOrderInput!): CreateOrderPayload!

        validatePrescription(
            orderId: ID!
        ): OrderCommandPayload!

        dispatchOrder(
            orderId: ID!
        ): OrderCommandPayload!

        cancelOrder(
            orderId: ID!
        ): OrderCommandPayload!
    }
    
    type Subscription {
    orderStatusChanged(orderId: ID!): Order!
    }

`;