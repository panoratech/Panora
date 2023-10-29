#!/bin/bash

# Check if an argument was provided
if [ -z "$1" ]; then
    echo "Please provide an argument: minor, major, or patch."
    exit 1
fi

# Ensure the argument is one of the expected values
if [ "$1" != "minor" ] && [ "$1" != "major" ] && [ "$1" != "patch" ]; then
    echo "Invalid argument. Expected 'minor', 'major', or 'patch'."
    exit 1
fi

# Update the version
npm version $1

pnpm run build

# Publish to npm
npm publish

echo "Published the $1 update to npm successfully."

