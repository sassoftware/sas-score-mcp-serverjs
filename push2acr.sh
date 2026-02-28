#
# syntax: push2acr.sh 
#
docker rmi sas-score-mcp-serverjs
az acr login --name kumar-xf1-rg
docker build --no-cache -t sas-score-mcp-serverjs .
docker tag sas-score-mcp-serverjs:latest kumar-xf1-rg.azurecr.io/sas-score-mcp-serverjs:alpha
docker push kumar-xf1-rg.azurecr.io/sas-score-mcp-serverjs:alpha