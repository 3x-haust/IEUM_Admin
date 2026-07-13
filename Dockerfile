FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_IEUM_API_BASE_URL
ARG VITE_MIRIM_OAUTH_CLIENT_ID
ARG VITE_MIRIM_OAUTH_CLIENT_SECRET
ARG VITE_MIRIM_OAUTH_REDIRECT_URI
ARG VITE_MIRIM_OAUTH_SCOPES
ARG VITE_MIRIM_OAUTH_SERVER_URL

ENV VITE_IEUM_API_BASE_URL=$VITE_IEUM_API_BASE_URL
ENV VITE_MIRIM_OAUTH_CLIENT_ID=$VITE_MIRIM_OAUTH_CLIENT_ID
ENV VITE_MIRIM_OAUTH_CLIENT_SECRET=$VITE_MIRIM_OAUTH_CLIENT_SECRET
ENV VITE_MIRIM_OAUTH_REDIRECT_URI=$VITE_MIRIM_OAUTH_REDIRECT_URI
ENV VITE_MIRIM_OAUTH_SCOPES=$VITE_MIRIM_OAUTH_SCOPES
ENV VITE_MIRIM_OAUTH_SERVER_URL=$VITE_MIRIM_OAUTH_SERVER_URL

COPY package.json yarn.lock ./
RUN corepack enable && corepack prepare yarn@1.22.22 --activate && yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
RUN cat > server.mjs <<'EOF'
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createServer } from 'node:http';

const root = join(process.cwd(), 'dist');
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const resolveFile = async (url) => {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(root, normalized === '/' ? 'index.html' : normalized);
  try {
    const file = await stat(candidate);
    return file.isFile() ? candidate : join(root, 'index.html');
  } catch {
    return join(root, 'index.html');
  }
};

createServer(async (request, response) => {
  const filePath = await resolveFile(request.url ?? '/');
  response.setHeader('Content-Type', types[extname(filePath)] ?? 'application/octet-stream');
  createReadStream(filePath).pipe(response);
}).listen(3000, '0.0.0.0');
EOF

EXPOSE 3000
CMD ["node", "server.mjs"]
