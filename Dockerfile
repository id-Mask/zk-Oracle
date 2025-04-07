# docker build -t us-central1-docker.pkg.dev/id-mask-409508/id-mask-oracle/id-mask-oracle .
# docker run -p 8080:8080 us-central1-docker.pkg.dev/id-mask-409508/id-mask-oracle/id-mask-oracle
# docker push us-central1-docker.pkg.dev/id-mask-409508/id-mask-oracle/id-mask-oracle
# gcloud run deploy --image us-central1-docker.pkg.dev/id-mask-409508/id-mask-oracle/id-mask-oracle --max-instances=1 --vpc-connector=id-mask-connector --vpc-egress=all-traffic



# Stage 1: Build dependencies
FROM node:20.18.3-alpine AS dependencies
WORKDIR /app
COPY package.json .
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN npm install --production
RUN apk del .build-deps

# Stage 2: Build production image
FROM node:20.18.3-alpine
WORKDIR /app
COPY --from=dependencies /app .
COPY server.js ./server.js
COPY config/ ./config/
COPY middleware/ ./middleware/
COPY routes/ ./routes/
COPY utils/ ./utils/
COPY .env .
COPY .googleCreds.json .

EXPOSE 8080
CMD ["npm", "run", "start"]
