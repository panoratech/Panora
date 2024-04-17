#!/bin/bash

# Make the script executable
# chmod +x connectorUpdate.sh

# Run the script with (vertical) and (provider)
# ./connectorUpdate.sh crm contact

# Calculate the directory where the script resides
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR" && cd ../../.. && pwd)"  # Adjust the path as necessary based on your directory structure

# Function to scan directories for new services
scanDirectory() {
    local dir=$1
    find "$dir" -mindepth 1 -maxdepth 1 -type d -exec basename {} \;
}

# Function to replace relative paths
replaceRelativePaths() {
    local path=$1
    echo "${path//..\/src\//@}"
}

# Function to generate import statements for new services
generateImportStatements() {
    local basePath=$1
    local objectType=$2
    local serviceNames=("$@")
    shift 2
    local importStatements=()
    for serviceName in "${serviceNames[@]}"; do
        local importPath="${basePath}/${serviceName}/types"
        local replacedPath=$(replaceRelativePaths "$importPath")
        local name="$(tr '[:lower:]' '[:upper:]' <<< "${serviceName:0:1}")${serviceName:1}$objectType"
        importStatements+=("import { ${name}Input, ${name}Output } from '${replacedPath}';")
    done
    printf "%s\n" "${importStatements[@]}"
}

# Function to append import statements and update type definitions
updateTargetFile() {
    local file=$1
    local imports=$2
    local serviceNames=("$@")
    shift 2

    # Append import statements to the file
    printf "%s\n\n" "$imports" >> "$file"

    # Update type definitions
    for serviceName in "${serviceNames[@]}"; do
        local typeName="$(tr '[:lower:]' '[:upper:]' <<< "${serviceName:0:1}")${serviceName:1}$OBJECT_TYPE"
        sed -i "/export type Original${OBJECT_TYPE}Input =/a \  | ${typeName}Input" "$file"
        sed -i "/export type Original${OBJECT_TYPE}Output =/a \  | ${typeName}Output" "$file"
    done
}

# Function to update mappings and module files
updateMappingsAndModules() {
    local vertical=$1
    local objectType=$2
    local serviceDirs=("$@")
    shift 2
    local mappingsPath="${MAPPINGS_FILE}/${vertical}/${objectType}/types/mappingsTypes.ts"
    local modulePath="${BASE_DIR}/src/${vertical}/${objectType}/${objectType}.module.ts"

    # Update module and mapping files
    for service in "${serviceDirs[@]}"; do
        local serviceClass="${service^}Service"
        if ! grep -q "$serviceClass" "$modulePath"; then
            echo "import { $serviceClass } from './services/${service}';" >> "$modulePath"
        fi
    done
}

# Main execution block
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <vertical> <objectType>"
    exit 1
fi

VERTICAL=$1
OBJECT_TYPE=$2

# Define paths based on input
TARGET_FILE="${BASE_DIR}/src/@core/utils/types/original/original${VERTICAL}.ts"
SERVICES_DIR="${BASE_DIR}/src/${VERTICAL}/${OBJECT_TYPE}/services"

# Scan for new services
newServices=($(scanDirectory "$SERVICES_DIR"))

# Generate import statements
imports=$(generateImportStatements "$SERVICES_DIR" "$OBJECT_TYPE" "${newServices[@]}")

# Update the target file
updateTargetFile "$TARGET_FILE" "$imports" "${newServices[@]}"

# Update mappings and module files
updateMappingsAndModules "$VERTICAL" "$OBJECT_TYPE" "${newServices[@]}"

echo "Update process completed for $VERTICAL $OBJECT_TYPE."
