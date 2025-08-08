'use client';

import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';

interface GraphQLProviderProps {
  children: React.ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}
