# docker build -t eu.gcr.io/id-mask-409508/id-mask-oracle .
# docker run -p 8080:8080 eu.gcr.io/id-mask-409508/id-mask-oracle
# docker push eu.gcr.io/id-mask-409508/id-mask-oracle
# gcloud run deploy --image eu.gcr.io/id-mask-409508/id-mask-oracle --max-instances=1 --vpc-connector=id-mask-connector --vpc-egress=all-traffic


# Stage 1: Build dependencies
FROM node:18.12.1-alpine as dependencies
WORKDIR /app
COPY package.json .
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN npm install --production
RUN apk del .build-deps

# Stage 2: Build production image
FROM node:18.12.1-alpine
WORKDIR /app
COPY --from=dependencies /app .
COPY *.js .
COPY .env .
COPY .googleCreds.json .

EXPOSE 8080
CMD ["npm", "run", "start"]
