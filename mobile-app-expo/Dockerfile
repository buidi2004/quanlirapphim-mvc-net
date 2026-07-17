FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Start Expo with LAN enabled so you can scan the QR code within the same network
CMD ["npx", "expo", "start", "--lan"]
