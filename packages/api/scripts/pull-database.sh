#!/bin/sh

# SCRIPT TO USE IF YOU WANT TO UPDATE YOUR PRISMA MODEL BASED ON YOUR DB 
# it pulls changes from your database to your Prisma schema 
# DB => PRISMA MODEL 

# Check if there are any new migrations and run them.
npx prisma db pull

# Generate Prisma Client
npx prisma generate