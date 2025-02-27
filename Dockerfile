# Use official Node.js image as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first for efficient layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on
EXPOSE 3030

# Command to run the application
CMD ["npm", "start"]
