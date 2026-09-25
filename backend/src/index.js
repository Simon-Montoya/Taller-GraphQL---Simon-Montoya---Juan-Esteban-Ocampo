import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import { expressMiddleware } from "@as-integrations/express5";

import express from "express";
import http from "http";
import cors from "cors";

import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./resolvers/index.js";

import {
  createMedicationLoader
} from "./loaders/medicationLoader.js";


/*
|--------------------------------------------------------------------------
| Express + HTTP Server
|--------------------------------------------------------------------------
*/

const app = express();

const httpServer = http.createServer(app);


/*
|--------------------------------------------------------------------------
| GraphQL Schema
|--------------------------------------------------------------------------
*/

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});


/*
|--------------------------------------------------------------------------
| WebSocket Server for GraphQL Subscriptions
|--------------------------------------------------------------------------
*/

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql"
});


/*
|--------------------------------------------------------------------------
| graphql-ws
|--------------------------------------------------------------------------
*/

const serverCleanup = useServer(
  {
    schema
  },
  wsServer
);


/*
|--------------------------------------------------------------------------
| Apollo Server
|--------------------------------------------------------------------------
*/

const server = new ApolloServer({
  schema,

  plugins: [
    /*
    |--------------------------------------------------------------------------
    | Close HTTP server correctly
    |--------------------------------------------------------------------------
    */

    ApolloServerPluginDrainHttpServer({
      httpServer
    }),

    /*
    |--------------------------------------------------------------------------
    | Close WebSocket server correctly
    |--------------------------------------------------------------------------
    */

    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          }
        };
      }
    }
  ]
});


/*
|--------------------------------------------------------------------------
| Start Apollo
|--------------------------------------------------------------------------
*/

await server.start();


/*
|--------------------------------------------------------------------------
| GraphQL HTTP Endpoint
|--------------------------------------------------------------------------
|
| Queries + Mutations:
| http://localhost:4000/graphql
|
|--------------------------------------------------------------------------
*/

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
        /*
        |--------------------------------------------------------------------------
        | DataLoaders are created PER REQUEST
        |--------------------------------------------------------------------------
        */

        loaders: {
          medication: createMedicationLoader()
        }
      };
    }
  })
);


/*
|--------------------------------------------------------------------------
| Start HTTP + WebSocket Server
|--------------------------------------------------------------------------
*/

const PORT = 4000;

await new Promise((resolve) => {
  httpServer.listen(
    {
      port: PORT
    },
    resolve
  );
});


/*
|--------------------------------------------------------------------------
| Startup Logs
|--------------------------------------------------------------------------
*/

console.log(
  `🚀 Afirmative Pill GraphQL Server ready at http://localhost:${PORT}/graphql`
);

console.log(
  `🔌 GraphQL Subscriptions ready at ws://localhost:${PORT}/graphql`
);