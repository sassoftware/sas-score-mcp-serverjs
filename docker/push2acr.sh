#
# syntax: push2acr.sh 
#
docker rmi sas-score-mcp-serverjs
az acr login --name sasscore
docker build --no-cache -t sas-score-mcp-serverjs .
docker tag sas-score-mcp-serverjs:latest sasscore.azurecr.io/sas-score-mcp-serverjs:latest
docker push sasscore.azurecr.io/sas-score-mcp-serverjs:latest