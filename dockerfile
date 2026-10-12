# FROM  node:20-alpine as frontend-builder


# COPY ./frontend /app
# WORKDIR /app

# RUN npm install
# RUN npm run build

# #backend

# FROM  node:20-alpine 


# COPY ./Backend /app
# WORKDIR /app

# RUN npm install
# COPY --from=frontend-builder /app/dist /app/public 


# CMD ["npx", "tsx", "server.ts"]




# Stage 1: Build the React + Vite frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# Stage 2: Run the Express backend
FROM node:20-alpine AS app

WORKDIR /app

COPY Backend/package*.json ./
RUN npm ci

COPY Backend/ ./

# Copy the built frontend into Express's public folder
COPY --from=frontend-builder /app/dist ./public

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
