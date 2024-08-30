# Use the lightweight Bun image as our base
FROM imbios/bun-node:latest 

# Working directory within the container
WORKDIR /app

# Copy dependency manifest files for efficient installation
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of your project source code
COPY . .

# Generate the Prisma client (Important for interacting with the database)
RUN bunx prisma generate 

# Expose the port used by your Hono application
EXPOSE 8080

# Command to start your application
CMD ["bun", "src/index.ts"] 
