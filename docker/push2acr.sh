#
# syntax: push2acr.sh <tag>
#
docker rmi sas-score-mcp-serverjs
az acr login --name viyafseditcr
docker build --no-cache -t sas-score-mcp-serverjs .
docker tag sas-score-mcp-serverjs:latest viyafseditcr.azurecr.io/sas-score-mcp-serverjs:$1
docker push viyafseditcr.azurecr.io/sas-score-mcp-serverjs:$1