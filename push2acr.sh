#
# syntax: push2acr.sh 
# Replace viyafseditcr with your ACR name and sas-score-mcp-serverjs with your image name if different. 
#
docker rmi viyafseditcr.azurecr.io/sas-score-mcp-serverjs-agent
az acr login --name viyafseditcr
docker build --no-cache --platform linux/amd64 -t  viyafseditcr.azurecr.io/sas-score-mcp-serverjs-agent .
docker push viyafseditcr.azurecr.io/sas-score-mcp-serverjs-agent:latest