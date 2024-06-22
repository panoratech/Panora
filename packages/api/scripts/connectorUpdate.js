/* 
(USED BY PANORA CONTRIBUTORS)

THIS SCRIPT UPDATES ALL DEPENDENCIES WHEN A NEW SERVICE 3RD PARTY IS ADDED TO THE CODEBASE 
AFTER ADDING THE NEW CONNECTOR, CONTRIBUTOR JUST HAS TO RUN (EXAMPLE FOR CRM VERTICAL AND CONTACT COMMON OBJECT)

  1. Build:
    docker build -t validate_connectors -f ./packages/api/Dockerfile.validate-connectors .
  2. Run:
    docker run -v $(pwd):/app/ -e VERTICAL=crm -e OBJECT_TYPE=contact validate_connectors
*/

import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { slugFromCategory } from '@panora/shared';

// Function to scan the directory for new service directories
function scanDirectory(dir) {
  const directories = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  return directories;
}

function replaceRelativePaths(path) {
  const pattern = /^\.\.\/src\//;
  if (pattern.test(path)) {
    return path.replace(pattern, '@');
  }
  return path;
}

// Function to extract possible provider to generate import statements for new service types
function getProvidersForImportStatements(
  file,
  allPossibleProviders,
  objectType,
) {
  let fileContent = fs.readFileSync(file, 'utf8');
  const possibleImports = allPossibleProviders.filter((provider) => {
    const name =
      provider.substring(0, 1).toUpperCase() +
      provider.substring(1) +
      objectType.substring(0, 1).toUpperCase() +
      objectType.substring(1);
    const inputObjPattern = new RegExp(`(${name}Input)`);
    const outputObjPattern = new RegExp(`(${name}Output)`);

    if (
      inputObjPattern.test(fileContent) ||
      outputObjPattern.test(fileContent)
    ) {
      return false;
    }
    return true;
  });

  return possibleImports;
}

// Function to generate import statements for new service types
function generateImportStatements(possibleProviders, basePath, objectType) {
  return possibleProviders.map((serviceName) => {
    const importPath = `${basePath}/${serviceName}/types`;
    const name =
      serviceName.substring(0, 1).toUpperCase() +
      serviceName.substring(1) +
      objectType.substring(0, 1).toUpperCase() +
      objectType.substring(1);
    return `import { ${name}Input, ${name}Output } from '${replaceRelativePaths(
      importPath,
    )}';`;
  });
}

function updateTargetFile(file, importStatements, serviceNames, objectType) {
  let fileContent = fs.readFileSync(file, 'utf8');
  objectType = objectType.charAt(0).toUpperCase() + objectType.slice(1);

  if (importStatements.length > 0) {
    fileContent = importStatements.join('\n') + '\n\n' + fileContent;
  }

  serviceNames.forEach((serviceName) => {
    const typeName =
      serviceName.charAt(0).toUpperCase() + serviceName.slice(1) + objectType;
    const inputTypeName = `${typeName}Input`;
    const outputTypeName = `${typeName}Output`;

    // Function to append type with correct pipe placement
    function appendType(baseType, newType) {
      const regex = new RegExp(`(export type ${baseType} =)([^;]*)`);
      if (regex.test(fileContent)) {
        fileContent = fileContent.replace(regex, (match, p1, p2) => {
          if (p2.trim().endsWith('|')) {
            return `${p1}${p2} ${newType}`;
          } else {
            return `${p1}${p2} | ${newType}`;
          }
        });
      } else {
        fileContent += `\nexport type ${baseType} = ${newType};\n`;
      }
    }

    // Update inputs and outputs
    appendType(`Original${objectType}Input`, inputTypeName);
    appendType(`Original${objectType}Output`, outputTypeName);
  });

  fs.writeFileSync(file, fileContent);
}

function readFileContents(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Function to update the contents of a file
function updateFileContents(filePath, newContents) {
  fs.writeFileSync(filePath, newContents);
}

function updateMappingsFile(
  mappingsFile,
  newServiceDirs,
  objectType,
  vertical,
) {
  let fileContent = fs.readFileSync(mappingsFile, 'utf8');

  // Identify where the existing content before the first import starts, to preserve any comments or metadata at the start of the file
  const firstImportIndex = fileContent.indexOf('import ');
  const beforeFirstImport =
    firstImportIndex > -1 ? fileContent.substring(0, firstImportIndex) : '';

  // Prepare sections of the file content for updates
  const afterFirstImport =
    firstImportIndex > -1
      ? fileContent.substring(firstImportIndex)
      : fileContent;

  const mappingStartIndex = afterFirstImport.indexOf(
    `export const ${objectType.toLowerCase()}UnificationMapping = {`,
  );
  const beforeMappingObject = afterFirstImport.substring(0, mappingStartIndex);
  const mappingObjectContent = afterFirstImport.substring(mappingStartIndex);

  let newImports = '';
  let newInstances = '';
  let newMappings = '';
  newServiceDirs.forEach((newServiceName) => {
    if (
      !(vertical === 'ticketing' && newServiceName.toLowerCase() === 'zendesk')
    ) {
      const serviceNameCapitalized =
        newServiceName.charAt(0).toUpperCase() + newServiceName.slice(1);
      const objectCapitalized =
        objectType.charAt(0).toUpperCase() + objectType.slice(1);

      const mapperClassName = `${serviceNameCapitalized}${objectCapitalized}Mapper`;
      const mapperInstanceName = `${newServiceName.toLowerCase()}${objectCapitalized}Mapper`;

      // Prepare the import statement and instance declaration
      const importStatement = `import { ${mapperClassName} } from '../services/${newServiceName}/mappers';\n`;
      const instanceDeclaration = `const ${mapperInstanceName} = new ${mapperClassName}();\n`;
      const mappingEntry = `  ${newServiceName.toLowerCase()}: {\n    unify: ${mapperInstanceName}.unify.bind(${mapperInstanceName}),\n    desunify: ${mapperInstanceName}.desunify.bind(${mapperInstanceName}),\n  },\n`;

      // Check and append new import if it's not already present
      if (!fileContent.includes(importStatement)) {
        newImports += importStatement;
      }

      // Append instance declaration if not already present before the mapping object
      if (!beforeMappingObject.includes(instanceDeclaration)) {
        newInstances += instanceDeclaration;
      }

      // Prepare and append new mapping entry if not already present in the mapping object
      if (!mappingObjectContent.includes(`  ${newServiceName}: {`)) {
        newMappings += mappingEntry;
      }
    }
  });

  // Combine updates with the original sections of the file content
  const updatedContentBeforeMapping =
    beforeFirstImport + newImports + beforeMappingObject.trim();

  // Update the mapping object content with new mappings
  const updatedMappingObjectContent = [
    mappingObjectContent.slice(0, mappingObjectContent.lastIndexOf('};')),
    newMappings,
    mappingObjectContent.slice(mappingObjectContent.lastIndexOf('};')),
  ].join('');

  // Reassemble the complete updated file content
  const updatedFileContent =
    updatedContentBeforeMapping +
    '\n' +
    newInstances +
    updatedMappingObjectContent;
  // Write the updated content back to the file
  fs.writeFileSync(mappingsFile, updatedFileContent);
}

// Function to extract the array from a file
function extractArrayFromFile(filePath, arrayName) {
  const fileContents = readFileContents(filePath);
  const regex = new RegExp(`export const ${arrayName} = \\[([^\\]]+)\\];`);
  const match = fileContents.match(regex);
  if (match) {
    return match[1].split(',').map((item) => item.trim().replace(/['"]/g, ''));
  }
  return [];
}

// Function to update the array in a file
function updateArrayInFile(filePath, arrayName, newArray) {
  const fileContents = readFileContents(filePath);
  const regex = new RegExp(`export const ${arrayName} = \\[([^\\]]+)\\];`);
  const newContents = fileContents.replace(
    regex,
    `export const ${arrayName} = [${newArray
      .map((item) => `'${item}'`)
      .join(', ')}];`,
  );
  updateFileContents(filePath, newContents);
}

function updateModuleFile(moduleFile, newServiceDirs) {
  let moduleFileContent = fs.readFileSync(moduleFile, 'utf8');

  // Generate and insert new service imports
  newServiceDirs.forEach((serviceName) => {
    const serviceClass =
      serviceName.charAt(0).toUpperCase() + serviceName.slice(1) + 'Service';
    const importStatement = `import { ${serviceClass} } from './services/${serviceName}';\n`;
    if (!moduleFileContent.includes(importStatement)) {
      moduleFileContent = importStatement + moduleFileContent;
    }

    // Add new service to the providers array if not already present
    const providerRegex = /providers: \[\n([\s\S]*?)\n  \],/;
    const match = moduleFileContent.match(providerRegex);
    if (match && !match[1].includes(serviceClass)) {
      const updatedProviders = match[1] + `\n    ${serviceClass},\n`;
      moduleFileContent = moduleFileContent.replace(
        providerRegex,
        `providers: [\n${updatedProviders}  ],`,
      );
    }
  });

  fs.writeFileSync(moduleFile, moduleFileContent);
}

function updateEnumFile(enumFilePath, newServiceDirs, vertical) {
  let fileContent = fs.readFileSync(enumFilePath, 'utf8');
  const base = vertical.substring(0, 1).toUpperCase() + vertical.substring(1);

  // Define the enum name to be updated based on the vertical
  let enumName = `${base}Connectors`;
  // Extract the enum content
  const enumRegex = new RegExp(`export enum ${enumName} {([\\s\\S]*?)}\n`, 'm');
  const match = fileContent.match(enumRegex);

  if (match && match[1]) {
    let enumEntries = match[1]
      .trim()
      .split(/\n/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.endsWith(',')) // Ensure all entries end with a comma
      .map((entry) => entry.replace(/,$/, '')); // Remove commas for a clean slate

    const existingEntries = enumEntries.map((entry) =>
      entry.split('=')[0].trim(),
    );

    // Prepare new entries to be added
    newServiceDirs.forEach((serviceName) => {
      const enumEntryName = serviceName.toUpperCase(); // Assuming the enum entry name is the uppercase service name
      if (!existingEntries.includes(enumEntryName)) {
        // Format the new enum entry, assuming you want the name and value to be the same
        enumEntries.push(`${enumEntryName} = '${serviceName}'`);
      }
    });

    // Add commas back to all entries except the last one
    enumEntries = enumEntries.map((entry, index, array) =>
      index === array.length - 1 ? entry : `${entry},`,
    );

    // Rebuild the enum content
    const updatedEnumContent = `export enum ${enumName} {\n    ${enumEntries.join(
      '\n    ',
    )}\n}\n`;

    // Replace the old enum content with the new one in the file content
    fileContent = fileContent.replace(enumRegex, updatedEnumContent);

    // Write the updated content back to the file
    fs.writeFileSync(enumFilePath, fileContent);
    //console.log(`Updated ${enumName} in ${enumFilePath}`);
  } else {
    console.error(`Could not find enum ${enumName} in file.`);
  }
}

// New function to update init.sql
function updateInitSQLFile(initSQLFile, newServiceDirs, vertical) {
  let fileContent = fs.readFileSync(initSQLFile, 'utf8');
  const insertPoint = fileContent.indexOf(
    'CONSTRAINT PK_project_connector PRIMARY KEY',
  );

  if (insertPoint === -1) {
    console.error(
      `Could not find the PRIMARY KEY constraint in ${initSQLFile}`,
    );
    return;
  }

  // Prepare new column lines to be inserted
  let newLines = newServiceDirs
    .map((serviceName) => {
      const columnName = `${vertical.toLowerCase()}_${serviceName.toLowerCase()}`;
      return ` ${columnName} boolean NOT NULL,\n`;
    })
    .join('');

  // Insert the new column definitions just before the PRIMARY KEY constraint
  fileContent =
    fileContent.slice(0, insertPoint) +
    newLines +
    fileContent.slice(insertPoint);

  fs.writeFileSync(initSQLFile, fileContent);
}

// New function to update seed.sql
function updateSeedSQLFile(seedSQLFile, newServiceDirs, vertical) {
  let fileContent = fs.readFileSync(seedSQLFile, 'utf8');
  console.log('new providers are ' + newServiceDirs);
  console.log('new vertical is ' + vertical);
  // Regex to find the INSERT statement for connector_sets
  const regex = /INSERT INTO connector_sets \(([^)]+)\) VALUES/g;
  let match;
  let lastMatch;
  while ((match = regex.exec(fileContent)) !== null) {
    lastMatch = match; // Store the last match
  }
  if (!lastMatch) {
    console.error('Could not find the INSERT INTO connector_sets statement.');
    return;
  }

  // Extracting columns and preparing to insert new ones
  let columns = lastMatch[1].split(',').map((col) => col.trim());
  let newColumns = newServiceDirs.map(
    (serviceName) => `${vertical.toLowerCase()}_${serviceName.toLowerCase()}`,
  );
  console.log(newColumns);

  // Filter out existing new columns to avoid duplication
  newColumns = newColumns.filter((nc) => !columns.includes(nc));
  if (newColumns.length > 0) {
    // Insert new columns before the closing parenthesis in the columns list
    columns = [...columns, ...newColumns];
    let newColumnsSection = columns.join(', ');

    // Replace the old columns section with the new one
    fileContent = fileContent.replace(lastMatch[1], newColumnsSection);

    // Update each VALUES section
    fileContent = fileContent.replace(/INSERT INTO connector_sets \(([^)]+)\) VALUES(.*?);/gs, (match) => {
      return match
        .replace(/\),\s*\(/g, '),\n    (') // Fix line formatting
        .replace(/\([^\)]+\)/g, (values, index) => {
          if (values.startsWith('(id_connector_set')) {
            return values
          }
          let newValues = newColumns.map(() => 'TRUE').join(', ');
          return values.slice(0, -1) + ', ' + newValues + ')';
        });
    });
  }
  // Write the modified content back to the file
  console.log(fileContent);

  fs.writeFileSync(seedSQLFile, fileContent);
  console.log('Seed SQL file has been updated successfully.');
}

// Main script logic
function updateObjectTypes(baseDir, objectType, vertical) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const servicesDir = path.join(__dirname, baseDir);
  const targetFile = path.join(
    __dirname,
    `../src/@core/utils/types/original/original.${vertical}.ts`,
  );

  const newServiceDirs = scanDirectory(servicesDir);
  // Extract the current provider arrays from providers.ts and enum.ts
  const providersFilePath = path.join(
    __dirname,
    '../../shared/src/connectors/index.ts',
  );
  const enumFilePath = path.join(
    __dirname,
    '../../shared/src/connectors/enum.ts',
  );
  const currentProviders = extractArrayFromFile(
    providersFilePath,
    `${vertical.toUpperCase()}_PROVIDERS`,
  );

  // Compare the extracted arrays with the new service names
  const newProviders = newServiceDirs.filter(
    (service) => !currentProviders.includes(service),
  );
  // Add any new services to the arrays
  const updatedProviders = [...currentProviders, ...newProviders];

  // Update the arrays in the files
  updateArrayInFile(
    providersFilePath,
    `${vertical.toUpperCase()}_PROVIDERS`,
    updatedProviders,
  );

  updateEnumFile(enumFilePath, newServiceDirs, vertical);
  const moduleFile = path.join(
    __dirname,
    `../src/${vertical}/${objectType.toLowerCase()}/${objectType.toLowerCase()}.module.ts`,
  );

  updateModuleFile(moduleFile, newServiceDirs, servicesDir);

  // Path to the mappings file
  // const mappingsFile = path.join(
  //   __dirname,
  //   `../src/${vertical}/${objectType.toLowerCase()}/types/mappingsTypes.ts`,
  // );

  // // Call updateMappingsFile to update the mappings file with new services
  // updateMappingsFile(mappingsFile, newServiceDirs, objectType, vertical);

  const possibleProviderForImportStatements = getProvidersForImportStatements(
    targetFile,
    newServiceDirs,
    objectType,
  );

  // Continue with the rest of the updateObjectTypes function...
  const importStatements = generateImportStatements(
    possibleProviderForImportStatements,
    baseDir,
    objectType,
  );
  // console.log(importStatements)
  updateTargetFile(
    targetFile,
    importStatements,
    possibleProviderForImportStatements,
    objectType,
  );

  // Update SQL files
  const initSQLFile = path.join(__dirname, './init.sql');
  updateInitSQLFile(initSQLFile, newProviders, slugFromCategory(vertical));

  const seedSQLFile = path.join(__dirname, './seed.sql');
  updateSeedSQLFile(seedSQLFile, newProviders, slugFromCategory(vertical));
}

// Example usage for ticketing/team
//updateObjectTypes('../src/ticketing/team/services', 'Team', 'ticketing');

// Check if the script is being run directly
if (import.meta.url === process.argv[1]) {
  // Get command-line arguments
  const args = process.argv.slice(1);
  const vertical = args[0];
  const objectType = args[1];
  const baseDir = `../src/${vertical.toLowerCase()}/${objectType.toLowerCase()}/services`;
  updateObjectTypes(baseDir, objectType, vertical);
}

const argv = yargs(hideBin(process.argv)).argv;
const baseDir = `../src/${argv.vertical.toLowerCase()}/${argv.objectType.toLowerCase()}/services`;
updateObjectTypes(baseDir, argv.objectType, argv.vertical);