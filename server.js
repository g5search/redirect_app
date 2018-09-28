const express = require('express')
const app = express()
const port = 3000

// respond to any GET request 
app.get('*', redirectApp)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

async function redirectApp(req, res) {
    var path = req.path
    var domain = req.headers.host
    var protical = req
    // var srvpath = path.join(srv, hostname);
    console.log('vhost for', req.headers.host);
    // query the database for the url and its destination

    res.redirect('https://google.com')
    // res.send('woot')
    // if (!servers[hostname]) {
    //   try {
    //     fs.accessSync(srvpath);
    //     servers[hostname] = serveStatic(srvpath, { redirect: true });
    //   } catch(e) {
    //     finalhandler(req, res);
    //   }
    // }
  
    // servers[hostname](req, res, finalhandler(req, res));
  }