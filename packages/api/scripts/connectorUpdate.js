import { log } from 'console';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

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

// Function to generate import statements for new service types
function generateImportStatements(serviceNames, basePath, objectType) {
  return serviceNames.map((serviceName) => {
    const importPath = `${basePath}/${serviceName}/types`;
    const name =
      serviceName.substring(0, 1).toUpperCase() +
      serviceName.substring(1) +
      objectType;
    return `import { ${name}Input, ${name}Output } from '${replaceRelativePaths(
      importPath,
    )}';`;
  });
}

function updateTargetFile(file, importStatements, serviceNames, objectType) {
  let fileContent = fs.readFileSync(file, 'utf8');

  // Append the import statements
  fileContent = importStatements.join('\n') + '\n\n' + fileContent;

  // Create updates for OriginalObjectTypeInput and OriginalObjectTypeOutput
  serviceNames.forEach((serviceName) => {
    const typeName =
      serviceName.charAt(0).toUpperCase() + serviceName.slice(1) + objectType; // Assuming naming convention
    const inputTypeName = `${typeName}Input`;
    const outputTypeName = `${typeName}Output`;

    // Update OriginalObjectTypeInput
    const inputRegex = new RegExp(`(export type Original${objectType}Input =)`);
    if (inputRegex.test(fileContent)) {
      fileContent = fileContent.replace(inputRegex, `$1\n  | ${inputTypeName}`);
    } else {
      // If the type doesn't exist, add it
      fileContent += `\nexport type Original${objectType}Input =\n  | ${inputTypeName};\n`;
    }

    // Update OriginalObjectTypeOutput
    const outputRegex = new RegExp(
      `(export type Original${objectType}Output =)`,
    );
    if (outputRegex.test(fileContent)) {
      fileContent = fileContent.replace(
        outputRegex,
        `$1\n  | ${outputTypeName}`,
      );
    } else {
      // If the type doesn't exist, add it
      fileContent += `\nexport type Original${objectType}Output =\n  | ${outputTypeName};\n`;
    }
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
  newServiceDirs
    .filter(
      (newServiceName) =>
        !(
          vertical === 'ticketing' && newServiceName.toLowerCase() === 'zendesk'
        ),
    )
    .forEach((newServiceName) => {
      const serviceNameCapitalized =
        newServiceName.charAt(0).toUpperCase() + newServiceName.slice(1);
      const mapperClassName = `${serviceNameCapitalized}${objectType}Mapper`;
      const mapperInstanceName = `${newServiceName.toLowerCase()}${objectType}Mapper`;

      // Prepare the import statement and instance declaration
      const importStatement = `import { ${mapperClassName} } from '../services/${newServiceName}/mappers';\n`;
      const instanceDeclaration = `const ${mapperInstanceName} = new ${mapperClassName}();\n`;
      const mappingEntry = `  ${newServiceName.toLowerCase()}: {\n    unify: ${mapperInstanceName}.unify.bind(${mapperInstanceName}),\n    desunify: ${mapperInstanceName}.desunify,\n  },\n`;

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
    });

  // Combine updates with the original sections of the file content
  const updatedContentBeforeMapping =
    beforeFirstImport +
    newImports +
    beforeMappingObject.trim() +
    '\n\n' +
    newInstances;

  // Update the mapping object content with new mappings
  const insertionPoint = mappingObjectContent.lastIndexOf('};');
  const updatedMappingObjectContent = [
    mappingObjectContent.slice(0, insertionPoint),
    newMappings,
    mappingObjectContent.slice(insertionPoint),
  ].join('');

  // Reassemble the complete updated file content
  const updatedFileContent =
    updatedContentBeforeMapping + updatedMappingObjectContent;

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
      const updatedProviders = match[1] + `    ${serviceClass},\n`;
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
  let enumName = `${base}Providers`;
  // Extract the enum content
  const enumRegex = new RegExp(`export enum ${enumName} {([\\s\\S]*?)}\n`, 'm');
  const match = fileContent.match(enumRegex);

  if (match && match[1]) {
    let enumEntries = match[1]
      .trim()
      .split(/\n/)
      .map((e) => e.trim())
      .filter((e) => e);
    const existingEntries = enumEntries.map((entry) =>
      entry.split('=')[0].trim(),
    );

    // Prepare new entries to be added
    newServiceDirs.forEach((serviceName) => {
      const enumEntryName = serviceName.toUpperCase(); // Assuming the enum entry name is the uppercase service name
      if (!existingEntries.includes(enumEntryName)) {
        // Format the new enum entry, assuming you want the name and value to be the same
        enumEntries.push(`${enumEntryName} = '${serviceName}',`);
      }
    });

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
    '../../shared/src/providers.ts',
  );
  const enumFilePath = path.join(__dirname, '../../shared/src/enum.ts');
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
  const mappingsFile = path.join(
    __dirname,
    `../src/${vertical}/${objectType.toLowerCase()}/types/mappingsTypes.ts`,
  );

  // Call updateMappingsFile to update the mappings file with new services
  updateMappingsFile(mappingsFile, newServiceDirs, objectType, vertical);

  // Continue with the rest of the updateObjectTypes function...
  const importStatements = generateImportStatements(
    newProviders,
    baseDir,
    objectType,
  );
  updateTargetFile(targetFile, importStatements, newProviders, objectType);
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

/*const options = yargs.usage('Usage: -vertical <vertical>').option('v', {
  alias: 'vertical',
  describe: 'Your vertical',
  type: 'string',
  demandOption: true,
}).argv;*/
const argv = yargs(hideBin(process.argv)).argv;

const baseDir = `../src/${argv.vertical.toLowerCase()}/${argv.object.toLowerCase()}/services`;
updateObjectTypes(baseDir, argv.object, argv.vertical);
