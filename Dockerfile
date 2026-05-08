FROM node:25-alpine
LABEL maintainer="deva.kumar@sas.com"
RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache curl
WORKDIR /app
EXPOSE 8080
CMD ["npx", "-y", "@sassoftware/sas-score-mcp-serverjs@dev"]
