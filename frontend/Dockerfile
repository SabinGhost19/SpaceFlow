FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies using npm (since bun.lockb exists but we use node)
RUN npm install --legacy-peer-deps

# Copy all application files
COPY . .

# Expose port
EXPOSE 8080

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
