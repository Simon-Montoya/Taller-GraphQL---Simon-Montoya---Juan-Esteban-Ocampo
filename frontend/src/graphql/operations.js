import { gql } from '@apollo/client';

// Intentionally condensed: clinical fields are fetched only by MedicationDetail.
export const CATALOG = gql`
  query Catalog($search: String) {
    medications(search: $search) { id name presentation price requiresPrescription }
  }
`;
export const MEDICATION_DETAIL = gql`
  query MedicationDetail($id: Int!) {
    medication(id: $id) {
      id sku name activeIngredient category dosage presentation manufacturer
      description price stock requiresPrescription
    }
  }
`;
export const ORDER_FIELDS = gql`
  fragment OrderFields on Order {
    id status total prescriptionReference prescriptionVerified createdAt
    items {
      id medicationId quantity unitPrice
      medication { id name presentation requiresPrescription }
    }
  }
`;
export const ORDER = gql`
  query TrackOrder($id: ID!) { order(id: $id) { ...OrderFields } }
  ${ORDER_FIELDS}
`;
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) { success errors { code message } order { ...OrderFields } }
  }
  ${ORDER_FIELDS}
`;
export const VALIDATE_PRESCRIPTION = gql`
  mutation ValidatePrescription($orderId: ID!) {
    validatePrescription(orderId: $orderId) { success errors { code message } order { ...OrderFields } }
  }
  ${ORDER_FIELDS}
`;
export const DISPATCH_ORDER = gql`
  mutation DispatchOrder($orderId: ID!) {
    dispatchOrder(orderId: $orderId) { success errors { code message } order { ...OrderFields } }
  }
  ${ORDER_FIELDS}
`;
export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) { success errors { code message } order { ...OrderFields } }
  }
  ${ORDER_FIELDS}
`;
