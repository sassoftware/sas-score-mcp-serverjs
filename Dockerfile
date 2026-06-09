FROM node:25-alpine
LABEL maintainer="deva.kumar@sas.com"
LABEL org.opencontainers.image.source=https://github.com/sassoftware/sas-score-mcp-serverjs
LABEL org.opencontainers.image.description="sas-score-mcp-serverjs"
LABEL org.opencontainers.image.licenses=Apache-2.0
RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache curl
WORKDIR /app
EXPOSE 8080
ENV APPHOST=0.0.0.0
ENV PORT=8080

CMD ["npx", "-y", "@sassoftware/sas-score-mcp-serverjs@dev"]
