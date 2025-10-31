
const http = require('http');
const url = require('url');
const net = require('net');
const PORT = process.env.PORT || 8080;
// 创建 HTTP 代理服务器
const server = http.createServer((req, res) => {
  
  if(req.url.endsWith('chaifengAskHttpProxy')){
    console.log('ok');
    res.write('httpProxy is ok ')
    res.end();
    return;
  }

  console.log(`HTTP request: ${req.method} ${req.url}`);
  // 解析请求 URL
  const { hostname, port, path } = url.parse(req.url);
  // 创建一个向目标服务器的 HTTP 请求
  const proxyReq = http.request({
    hostname,
    port,
    path,
    method: req.method,
    headers: req.headers,
  }, (proxyRes) => {
    console.log(`HTTP response: ${proxyRes.statusCode}`);
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  req.pipe(proxyReq);
});
// 监听端口
server.listen(PORT, () => {
  console.log(`HTTP proxy server is listening on port ${PORT}.`);
});
// 创建 TCP 代理服务器
server.on('connect', (req, cltSocket, head) => {
  console.log(`TCP request: ${req.method} ${req.url}`);
  // 解析请求 URL
  const { hostname, port } = url.parse(`http://${req.url}`);
  // 创建一个向目标服务器的 TCP 连接
  const srvSocket = net.connect(port || 80, hostname, () => {
    console.log(`TCP connection established: ${hostname}:${port || 80}`);
    cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
      'Proxy-agent: Node.js-Proxy\r\n' +
      '\r\n');
    srvSocket.write(head);
    srvSocket.pipe(cltSocket);
    cltSocket.pipe(srvSocket);
  });
});

process.on('uncaughtException', (err) => {
  console.error(`Caught exception: ${err.message}`);
});