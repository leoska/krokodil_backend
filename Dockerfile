# Import container with nodejs v18
FROM node:18.14.2-bullseye

# Install PM2 Globally in Container
#RUN npm install -g pm2

# Create app directory
WORKDIR /app

# Bundle app source
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./nodemon.json ./nodemon.json 

# If you are building your code for production
# RUN npm ci --only=production
RUN npm install

# Expose HTTP Port
EXPOSE 8080

# Expose WebSocket Ports
EXPOSE 25565-27632

# Run server
CMD [ "npm", "run", "watch-gaming" ]