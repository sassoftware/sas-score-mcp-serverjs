FROM node:25-alpine
LABEL maintainer="deva.kumar@sas.com"
RUN apk add --no-cache --upgrade bash
WORKDIR /usr/src/app
# COPY ./xf1 ./sslCert
COPY . .
RUN rm .env
EXPOSE 8080
ENV APPHOST=0.0.0.0
# RUN npm install
ENV PORT=8080
ENV HTTPS=FALSE
ENV MCPTYPE=http
ENV AUTHTYPE=refresh
ENV REFRESH_TOKEN=203512c9e4df49fba76074dd20d7798e-r

# ENV AUTHFLOW=bearer
ENV CLIENTID=mcpserver
ENV CLIENTSECRET=jellico
# ENV VIYA_SERVER=
# ENV SSLCERT=./sslCert
ENV VIYACERT=./ssl_00m
ENV CAS_SERVER=cas-shared-default
# APPNAME defaults to sas-score-mcp-serverjs but you can override it here
ENV APPNAME=sas-score-mcp-serverjs
ENV COMPUTECONTEXT="SAS Job Execution compute context"
ENV SAMESITE="Lax,secure"
ENV REDIRECT=/info
ENV AUTOLOGON=FALSE
CMD ["npm", "start"]