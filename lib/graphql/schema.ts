import { makeSchema } from 'nexus';
import { join } from 'path';
import * as types from './types';

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(process.cwd(), 'lib/graphql/generated/nexus-typegen.ts'),
    schema: join(process.cwd(), 'lib/graphql/generated/schema.graphql'),
  },
  contextType: {
    module: join(process.cwd(), 'lib/graphql/context.ts'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
  features: {
    abstractTypeStrategies: {
      resolveType: false,
      isTypeOf: false,
      __typename: true,
    },
  },
});
