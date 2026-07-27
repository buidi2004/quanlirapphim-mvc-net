FROM node:20-alpine

# Set working directory
WORKDIR /app

# Expose Metro bundler port
EXPOSE 8081

# Run npm install on startup to keep node_modules in sync, then start Expo.
# We avoid running npm ci during build to prevent the 30s+ volume copying delay during container creation.
CMD ["sh", "-c", "npm install && npx expo start --lan"]
