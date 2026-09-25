import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import { expressMiddleware } from "@as-integrations/express5";

import express from "express";
import http from "http";
import cors from "cors";

import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./resolvers/index.js";

import {
  createMedicationLoader
} from "./loaders/medicationLoader.js";


const app = express();

const httpServer = http.createServer(app);


const server = new ApolloServer({
  typeDefs,
  resolvers,

  plugins: [
    ApolloServerPluginDrainHttpServer({
      httpServer
    })
  ]
});


await server.start();


app.use(
  "/graphql",

  cors({
    origin: [
      "http://localhost:5173",
      "https://studio.apollographql.com"
    ]
  }),

  express.json(),

  expressMiddleware(server, {
    context: async () => {
      return {
        loaders: {
          medication: createMedicationLoader()
        }
      };
    }
  })
);


const PORT = 4000;

await new Promise((resolve) => {
  httpServer.listen(
    {
      port: PORT
    },
    resolve
  );
});


console.log(
  `🚀 Afirmative Pill GraphQL Server ready at http://localhost:${PORT}/graphql`
);