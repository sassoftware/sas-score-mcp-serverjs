#
# syntax: push2acr.sh 
#
docker rmi sas-score-mcp-serverjs
az acr login --name viyafseditcr
docker build --no-cache -t sas-score-mcp-serverjs .
docker tag sas-score-mcp-serverjs:latest viyafseditcr.azurecr.io/sas-score-mcp-serverjs:latest
docker push viyafseditcr.azurecr.io/sas-score-mcp-serverjs:latest