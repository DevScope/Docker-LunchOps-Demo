# syntax=docker/dockerfile:1.4

FROM node:lts-alpine AS development

ENV CI=true
ENV PORT=3000

WORKDIR /code
COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json
RUN npm ci
COPY . /code

CMD [ "npm", "start" ]

FROM development AS builder

RUN npm run build

FROM development as dev-envs
RUN apt-get update && \
    apt-get install -y --no-install-recommends git

RUN useradd -s /bin/bash -m vscode && \
    groupadd docker && \
    usermod -aG docker vscode
# install Docker tools (cli, buildx, compose)
COPY --from=gloursdocker/docker / /
CMD [ "npm", "start" ]

FROM nginx:1.29-alpine

ARG BACKEND_URL=http://localhost:80
ENV REACT_APP_BACKEND_URL=${BACKEND_URL}

COPY --from=builder /code/build /usr/share/nginx/html
