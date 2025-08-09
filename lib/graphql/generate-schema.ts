import { writeFileSync } from 'fs';
import { join } from 'path';
import { schema } from './schema';
import { printSchema } from 'graphql';

async function generateSchema() {
  try {
    console.log('Generating GraphQL schema...');
    
    // Generate SDL schema
    const sdl = printSchema(schema);
    
    // Write to file
    const schemaPath = join(process.cwd(), 'lib/graphql/schema.graphql');
    writeFileSync(schemaPath, sdl);
    
    console.log('Schema generated successfully');
    console.log(`Schema written to: ${schemaPath}`);
    
  } catch (error) {
    console.error('Error generating schema:', error);
    process.exit(1);
  }
}

generateSchema();
