ARG NODE_IMAGE=node:23-alpine

###### First Stage - Creating base ######
FROM $NODE_IMAGE AS base
RUN mkdir -p /home/node/app && chown node:node /home/node/app 
WORKDIR /home/node/app
RUN npm install -g pnpm
USER node
RUN mkdir tmp

###### Second Stage - Installing dependencies ######
FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN pnpm install
COPY --chown=node:node . .

###### Third Stage - Building Stage ######
FROM dependencies AS build
RUN node ace build

###### Final Stage - Production ######
FROM base AS production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
COPY --chown=node:node --from=build /home/node/app/build .
RUN pnpm install --prod
EXPOSE $PORT
CMD node bin/server.js
