# SCRIPT TO USE IF YOU WANT TO UPDATE YOUR DB BASED ON YOUR PRISMA UPDATES
# it pushes changes from your Prisma schema to the database 
# PRISMA MODEL => DB 

# Check if there are any new migrations and run them.
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Get the current timestamp
timestamp=$(date +"%Y-%m-%d %H:%M:%S")

# Print a message with the timestamp to inform the user
echo "Prisma schema updated and Prisma Client generated successfully [$timestamp]"