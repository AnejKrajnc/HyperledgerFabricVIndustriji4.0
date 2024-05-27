FROM node:18.16.0-alpine as base

# Add package file
COPY package.json ./

# Install deps
RUN yarn install

# Copy source
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Build dist
RUN yarn build

# Start production image build
FROM node:18.16.0-alpine

# Copy node modules and build directory
COPY --from=base ./node_modules ./node_modules
COPY --from=base ./dist ./dist

COPY .env ./
COPY config.json ./

# Copy crypto material to image


CMD ["node", "dist/index.js"]