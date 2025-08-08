import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// HTTP Link
const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3903/api/graphql'
    : '/api/graphql',
});

// Auth Link - Add JWT token to requests
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage or session
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
    : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error Link - Handle GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle authentication errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        sessionStorage.removeItem('auth-token');
        window.location.href = '/auth/login';
      }
    }
  }
});

// Cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          // Merge existing users with new ones
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
        roles: {
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
        menuItems: {
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
    User: {
      fields: {
        // Cache user relationships
        role: {
          merge: true,
        },
        userRoles: {
          merge: true,
        },
      },
    },
    Role: {
      fields: {
        users: {
          merge: true,
        },
        menuPermissions: {
          merge: true,
        },
      },
    },
    MenuItem: {
      fields: {
        children: {
          merge: true,
        },
        rolePermissions: {
          merge: true,
        },
      },
    },
  },
});

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Enable dev tools in development
  connectToDevTools: process.env.NODE_ENV === 'development',
});

// Helper function to clear cache
export const clearApolloCache = () => {
  apolloClient.cache.reset();
};

// Helper function to refetch all queries
export const refetchAllQueries = () => {
  apolloClient.refetchQueries({
    include: 'active',
  });
};
