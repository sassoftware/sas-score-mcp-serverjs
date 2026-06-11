#
# syntax: push2acr.sh 
# Replace viyhttps://portal.azure.com/#homeafseditcr with your ACR name and sas-score-mcp-serverjs with your image name if different. 
#
docker rmi viyafseditcr.azurecr.io/sas-score-mcp-serverjs
az acr login --name viyafseditcr
docker build --no-cache --platform linux/amd64 -t  viyafseditcr.azurecr.io/sas-score-mcp-serverjs .
docker push viyafseditcr.azurecr.io/sas-score-mcp-serverjs:latest