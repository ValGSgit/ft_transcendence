# Use a lightweight Node.js image
FROM node:20-alpine

# Set the folder inside the container
WORKDIR /app

# Copy dependency definitions first (for better caching)
COPY package*.json ./

# Install Three.js, Lil-GUI, and Vue
RUN npm install

# Copy the rest of your farm code
COPY . .

# Open the door for the browser
EXPOSE 5173

# Start the farm!
CMD ["npm", "run", "dev"]