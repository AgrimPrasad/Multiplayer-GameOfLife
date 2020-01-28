FROM node:12-alpine

# 
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install node_modules into app directory
RUN npm install

# Bundle app source
COPY . .

# Expose port 3000 for npm server
EXPOSE 3000

CMD ["npm", "run", "server-prod"]
