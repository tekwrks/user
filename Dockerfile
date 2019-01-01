FROM node:10-alpine

# Install yarn
RUN npm install --global yarn

# Install pm2
RUN yarn global add pm2

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

# Bundle app source
COPY . .

# Start
EXPOSE 7000
USER node
ENTRYPOINT [ "pm2-docker", "index.js" ]
