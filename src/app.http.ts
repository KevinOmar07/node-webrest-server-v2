import http from 'http';
import fs from  'fs';

const server = http.createServer((req, res) => {

    console.log(req.url);

    // const data = { 'name': 'Kev', 'age': 23, 'city': 'Tux' };
    // res.writeHead(200, { 'Content-Type': 'application/json' });
    // res.end(JSON.stringify(data))

    if(req.url  === '/'){
        const  htmlFIle = fs.readFileSync('./public/index.html', 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end( htmlFIle );
        return
    }

    if( req.url?.endsWith('.js')){
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
    } else if(req.url?.endsWith('.css')){
        res.writeHead(200, { 'Content-Type': 'text/css' });
    }

    const  responseContent = fs.readFileSync(`./public${req.url}`, 'utf-8');
    res.end( responseContent );



});

server.listen(3000, () => {
    console.log('Server running on port 3000');

})