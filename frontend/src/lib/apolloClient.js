import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

let connectionStatus = 'connecting';
const connectionListeners = new Set();
function setConnectionStatus(status) {
  connectionStatus = status;
  connectionListeners.forEach(listener => listener());
}
export function subscribeToConnection(listener) {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
}
export function getConnectionStatus() { return connectionStatus; }

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });
const wsClient = createClient({
  url: 'ws://localhost:4000/graphql',
  lazy: true,
  retryAttempts: 5,
  connectionAckWaitTimeout: 10000,
  on: {
    connecting: () => setConnectionStatus('connecting'),
    connected: () => setConnectionStatus('connected'),
    closed: () => setConnectionStatus('disconnected'),
    error: () => setConnectionStatus('disconnected'),
  },
});
const wsLink = new GraphQLWsLink(wsClient);

export const apolloClient = new ApolloClient({
  link: split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    httpLink,
  ),
  cache: new InMemoryCache(),
});

// Vite hot reload must not leave the old WebSocket client running.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    apolloClient.stop();
    void wsClient.dispose();
  });
}
