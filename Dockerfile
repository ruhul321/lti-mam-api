FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the files
COPY . .

# Expose LTI app port
EXPOSE 3000

# Run the LTI server
CMD ["node", "lti.js"]
