import open from 'open';

async function urlOpen(contexts) {
  let appHost = process.env.APPHOST || 'localhost';
  let appPort = process.env.PORT || '8080';
  let appName = process.env.APPNAME || 'mcpserver';
  let protocol =  (process.env.HTTPS != null && process.env.HTTPS.toUpperCase() === 'TRUE') ? 'https' : 'http';
  let urlx = `${protocol}://${appHost}:${appPort}/${appName}`;
  console.log(`Opening URL: ${urlx}`); 
  await open(urlx, {wait:true});
}
export default urlOpen;