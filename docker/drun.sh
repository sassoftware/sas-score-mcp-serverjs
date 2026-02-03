docker rmi sas-score-mcp-serverjs
docker build --no-cache -t sas-score-mcp-serverjs .
docker run  -p 8080:8080 -e VIYA_SERVER=https://viya-00m2kebi2b.engage.sas.com  sas-score-mcp-serverjs