import { scalarType } from 'nexus';
import { DateTimeResolver } from 'graphql-scalars';

export const DateTime = scalarType({
  name: 'DateTime',
  serialize: DateTimeResolver.serialize,
  parseValue: DateTimeResolver.parseValue,
  parseLiteral: DateTimeResolver.parseLiteral,
});
