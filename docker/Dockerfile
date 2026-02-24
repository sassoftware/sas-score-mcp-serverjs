FROM node:25-alpine
LABEL maintainer="deva.kumar@sas.com"
RUN apk add --no-cache --upgrade bash
WORKDIR /usr/src/app
COPY ./00m ./sslCert

EXPOSE 8080
ENV APPHOST=0.0.0.0
# RUN npm install
ENV PORT=8080
ENV HTTPS=FALSE
ENV MCPTYPE=http
ENV AUTHFLOW=bearer
ENV CLIENTID=mcpserver
ENV CLIENTSECRET=jellico
ENV VIYA_SERVER=https://viya.kumar-xf1-azure-nginx-d3ee0fdd.unx.sas.com
ENV SSLCERT=./sslCert
# ENV VIYACERT=c:\Users\kumar\viyaCert\xf1
ENV CAS_SERVER=cas-shared-default
# APPNAME defaults to sas-score-mcp-serverjs but you can override it here
ENV APPNAME=sas-score-mcp-serverjs
ENV COMPUTECONTEXT="SAS Job Execution compute context"
ENV SAMESITE="Lax,secure"
ENV REDIRECT=/info
ENV AUTOLOGON=FALSE
CMD ["npx", "-y", "@sassoftware/sas-score-mcp-serverjs@0.3.14"]