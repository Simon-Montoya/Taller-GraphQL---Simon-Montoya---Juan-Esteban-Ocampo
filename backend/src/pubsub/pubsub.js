import { PubSub } from "graphql-subscriptions";

export const pubsub = new PubSub();

export const ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED";