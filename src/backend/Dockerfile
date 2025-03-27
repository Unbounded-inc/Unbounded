# Use a minimal Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose the port DigitalOcean expects
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
