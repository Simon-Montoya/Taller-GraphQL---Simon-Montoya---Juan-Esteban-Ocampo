import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./resolvers/index.js";

import {
  createMedicationLoader
} from "./loaders/medicationLoader.js";

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000
  },

  context: async () => {
    return {
      loaders: {
        medication: createMedicationLoader()
      }
    };
  }
});

console.log(
  `🚀 Afirmative Pill GraphQL Server ready at ${url}`
);