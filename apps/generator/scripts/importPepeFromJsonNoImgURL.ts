import 'dotenv/config';
import { db, init } from 'db';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { z } from 'zod';

// Define the schema for a single Pepe metadata
const PepeMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string(),
  attributes: z.array(
    z.object({
      trait_type: z.string(),
      value: z.string(),
    }),
  ),
});

// Define the schema for the metadata file (can be either a single object or an array of objects)
const MetadataSchema = z.union([
  PepeMetadataSchema,
  z.array(PepeMetadataSchema)
]);

// Define the trait categories in order
const ORDERED_TRAITS = ['bg', 'skin', 'eyes', 'head', 'mouth', 'shirt', 'hands'] as const;
const ORDERED_TRAITS_NAMES = ['Background', 'Skin', 'Eyes', 'Head', 'Mouth', 'Shirt', 'Hands'] as const;

// Helper function to normalize trait option names
function normalizeTraitOptionName(name: string): string {
  // Convert to lowercase and replace all separators (spaces, underscores, hyphens) with hyphens
  return name.toLowerCase().replace(/[\s_-]+/g, '-');
}

async function importPepeFromJson() {
  try {
    // Initialize database connection
    await init();
    console.log('Database initialized successfully');

    // Read and parse the metadata file
    const metadataPath = path.join(process.cwd(), 'public', 'import', '_metadata.json');
    if (!existsSync(metadataPath)) {
      throw new Error('_metadata.json file not found in public/import directory');
    }

    const metadataContent = readFileSync(metadataPath, 'utf-8');
    const parsedData = JSON.parse(metadataContent);
    const metadata = MetadataSchema.parse(parsedData);

    // Convert single object to array if needed
    const pepeMetadataArray = Array.isArray(metadata) ? metadata : [metadata];
    console.log(`Found ${pepeMetadataArray.length} Pepes to import`);

    // Get all traits and options from the database
    const traits = await db
      .selectFrom('traits')
      .select(['id', 'folder', 'name'])
      .execute();

    const traitOptions = await db
      .selectFrom('traitOptions')
      .select(['id', 'file', 'name', 'traitId'])
      .execute();

    // Create a map of trait names to IDs
    const traitMap = new Map(traits.map(trait => [trait.name, trait]));

    // Create a map of normalized trait option names to options
    const traitOptionsMap = new Map(
      traitOptions.map(option => [
        `${option.traitId}-${normalizeTraitOptionName(option.name)}`,
        option
      ])
    );

    // Import each Pepe
    const importedPepeIds = [];
    for (const pepeMetadata of pepeMetadataArray) {
      console.log(`\nImporting Pepe: ${pepeMetadata.name}`);

      // Create the new Pepe
      const pepe = await db
        .insertInto('pepes')
        .values({
          imageUrl: null,
          isApproved: true,
          status: 'active',
        })
        .returning('id')
        .executeTakeFirst();

      if (!pepe) {
        console.warn(`Failed to create Pepe: ${pepeMetadata.name}`);
        continue;
      }
      console.log(`Created new Pepe with ID: ${pepe.id}`);

      // Process each trait in order
      const pepeTraits = [];
      for (let i = 0; i < ORDERED_TRAITS.length; i++) {
        const traitType = ORDERED_TRAITS[i];
        const traitTypeName = ORDERED_TRAITS_NAMES[i];
        const attribute = pepeMetadata.attributes.find(attr => attr.trait_type === traitTypeName);

        if (!attribute) {
          console.warn(`No attribute found for trait type: ${traitType}`);
          continue;
        }

        const trait = traitMap.get(traitType);
        if (!trait) {
          console.warn(`No trait found for type: ${traitType}`);
          continue;
        }

        // Normalize the attribute value for lookup
        const normalizedValue = normalizeTraitOptionName(attribute.value);
        const option = traitOptionsMap.get(`${trait.id}-${normalizedValue}`);

        if (!option) {
          // Try to find a partial match if exact match fails
          const matchingOption = traitOptions.find(
            opt => opt.traitId === trait.id &&
              normalizeTraitOptionName(opt.name).includes(normalizedValue)
          );

          if (!matchingOption) {
            console.warn(`No option found for trait: ${traitType} with value: ${attribute.value}`);
            continue;
          }

          // console.log(`Found partial match for ${attribute.value}: ${matchingOption.name}`);
          pepeTraits.push({
            pepeId: pepe.id,
            traitId: trait.id,
            traitOptionId: matchingOption.id,
            index: i,
          });
        } else {
          pepeTraits.push({
            pepeId: pepe.id,
            traitId: trait.id,
            traitOptionId: option.id,
            index: i,
          });
        }
      }

      // Insert all traits at once
      if (pepeTraits.length > 0) {
        await db
          .insertInto('pepeTraits')
          .values(pepeTraits)
          .execute();
        // console.log(`Inserted ${pepeTraits.length} traits for Pepe ${pepe.id}`);
        importedPepeIds.push(pepe.id);
      } else {
        console.warn(`No traits were inserted for Pepe ${pepe.id}`);
      }
    }

    // console.log('\nImport completed successfully');
    // console.log(`Imported ${importedPepeIds.length} Pepes with IDs: ${importedPepeIds.join(', ')}`);
    return importedPepeIds;

  } catch (error) {
    console.error('Error importing Pepes:', error);
    throw error;
  } finally {
    // Always destroy the database connection when done
    await db.destroy();
    console.log('Database connection closed');
  }
}

// Run the script
importPepeFromJson()
  .then((ids) => {
    console.log(`Successfully imported Pepes with IDs: ${ids.join(', ')}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
