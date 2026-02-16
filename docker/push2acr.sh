#
# syntax: push2acr.sh 
#
docker rmi sas-score-mcp-serverjs
az acr login --name sasscoremcpcr
docker build --no-cache -t sas-score-mcp-serverjs .
docker tag sas-score-mcp-serverjs:latest sasscoremcpcr.azurecr.io/sas-score-mcp-serverjs:latest
docker push sasscoremcpcr.azurecr.io/sas-score-mcp-serverjs:latest