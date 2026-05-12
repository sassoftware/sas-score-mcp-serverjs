#
# syntax: push2ghcr.sh 
#
# set GH_TOKEN and GH_USERNAME environment variables before running this script
docker rmi sas-score-mcp-serverjs

# echo $GH_TOKEN | docker login ghcr.io -u $GH_USERNAME --password-stdin
docker build --no-cache --platform linux/amd64 -t ghcr.io/sassoftware/sas-score-mcp-serverjs:latest .
# docker tag sas-score-mcp-serverjs:latest ghcr.io/sassoftware/sas-score-mcp-serverjs:latest
docker push ghcr.io/sassoftware/sas-score-mcp-serverjs:latest