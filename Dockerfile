FROM node:25-alpine
LABEL maintainer="deva.kumar@sas.com"
RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache curl
WORKDIR /app
COPY . .

# ENV NODE_EXTRA_CA_CERTS=./.tls/ca.pem
RUN rm .env
EXPOSE 8080
ENV APPHOST=0.0.0.0
# RUN npm install
ENV PORT=8080
ENV HTTPS=FALSE
ENV MCPTYPE=http
ENV AUTHFLOW=refresh
ENV REFRESH_TOKEN=cd88925b44754b5d9c131896419daba6-r

# ENV AUTHFLOW=bearer

ENV CLIENTID=mcpserver
ENV CLIENTSECRET=jellico
ENV VIYA_SERVER=https://viya-00m2kebi2b.engage.sas.com
ENV SSLCERT=NONE
ENV VIYACERT=./.tls
ENV CAS_SERVER=cas-shared-default
# APPNAME defaults to sas-score-mcp-serverjs but you can override it here
ENV APPNAME=sas-score-mcp-serverjs
ENV COMPUTECONTEXT="SAS Job Execution compute context"
ENV SAMESITE="Lax,secure"
ENV REDIRECT=/info
ENV AUTOLOGON=FALSE
CMD ["npm", "start"]