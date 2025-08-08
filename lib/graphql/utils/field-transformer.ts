import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

export function transformFields(info: GraphQLResolveInfo) {
  const fields = graphqlFields(info);
  
  // Transform GraphQL fields to Prisma select
  const transformedFields = transformGraphQLFieldsToPrismaSelect(fields);
  
  return {
    select: transformedFields
  };
}

function transformGraphQLFieldsToPrismaSelect(fields: any): any {
  const select: any = {};
  
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'object' && value !== null) {
      // Handle nested fields
      const nestedFields = value as Record<string, any>;
      
      // Skip __typename and other GraphQL meta fields
      if (key.startsWith('__')) {
        continue;
      }
      
      // Handle special cases for relations
      if (Object.keys(nestedFields).length > 0) {
        select[key] = {
          select: transformGraphQLFieldsToPrismaSelect(nestedFields)
        };
      } else {
        select[key] = true;
      }
    } else {
      // Simple scalar field
      if (!key.startsWith('__')) {
        select[key] = true;
      }
    }
  }
  
  return select;
}

// Helper function to get only the fields requested in GraphQL query
export function getRequestedFields(info: GraphQLResolveInfo): string[] {
  const fields = graphqlFields(info);
  return Object.keys(fields).filter(key => !key.startsWith('__'));
}

// Transform Prisma include to select for better performance
export function optimizePrismaQuery(include: any): any {
  if (!include) return {};
  
  const select: any = {};
  
  for (const [key, value] of Object.entries(include)) {
    if (value === true) {
      select[key] = true;
    } else if (typeof value === 'object' && value !== null) {
      select[key] = {
        select: optimizePrismaQuery(value)
      };
    }
  }
  
  return { select };
}
