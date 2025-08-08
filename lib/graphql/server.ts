import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import { createContext } from './context';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const { handleRequest } = createYoga({
  schema,
  context: async (initialContext) => {
    // Extract user from request headers (JWT token)
    const authHeader = initialContext.request.headers.get('authorization');
    let user: any = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      
      try {
        // Verify JWT token and extract user info
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        
        if (decoded && typeof decoded === 'object' && decoded.id) {
          const userRecord = await prisma.users.findUnique({
            where: { id: decoded.id },
            include: { roles: true }
          });
          
          if (userRecord) {
            user = {
              id: userRecord.id,
              email: userRecord.email || '',
              role: userRecord.roles.name
            };
          }
        }
      } catch (error) {
        console.error('JWT verification failed:', error);
        // Continue without user context
      }
    }
    
    return createContext(prisma, user);
  },
  
  // Enable GraphQL Playground in development
  graphiql: process.env.NODE_ENV === 'development',
  
  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3900', 'http://localhost:3000', 'http://localhost:3903']
      : [process.env.NEXTAUTH_URL || 'https://app.tazagroup.vn'],
    credentials: true,
  },
  
  // Error handling
  maskedErrors: process.env.NODE_ENV === 'production',
  
  // Health check
  landingPage: false,
});
