/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
const JLog	 = require("../sub/jjlog");
const http = require('http');
const Server = http.createServer();
const url = require('url');
const proxy = require('http2-proxy');

const defaultWSHandler = (err, req, socket, head) => {
	socket.id = url.parse(req.url).pathname.split("/")[2];
	
	socket.on('error', function(err){
		JLog.warn(`[Handler] Handler has an error: ${err.toString()}`);
	});
	socket.on('close', function(code){
		JLog.log(`[Handler] Socket @${socket.id} Closed`);
		socket.removeAllListeners();
		delete socket;
	});
	if(err) socket.destroy();
}

const ports = [
    // ports
];

JLog.info("<< KKuTu Handler >>");
Server.on('upgrade', (req, socket, head) => {
	try {
		var remoteIp = req.headers['x-hw-forwarded-for'] === undefined ? 'client' : req.headers['x-hw-forwarded-for'];
		var pathname = url.parse(req.url).pathname;
		if(!remoteIp || !pathname) {
			JLog.log(`[Handler] Invalid Response Received`);
			socket.destroy();
		} else if(remoteIp == 'client') {
			passWS(req, socket, head, pathname, remoteIp);
		} else {
			passWS(req, socket, head, pathname, remoteIp);
		}
	} catch (e) {
		JLog.error(e);
	}
});

function passWS(req, socket, head, pathname, remoteIp) {
	const remotePort = pathname.substring(2,7);
	if (ports.includes(parseInt(remotePort)) && req.method == 'GET') {	  
		JLog.log(`[Handler] ${remoteIp} ${pathname} GET`);
		proxy.ws(req, socket, head, {
			hostname: '127.0.0.1',
			port: remotePort,
			path: pathname.substring(7,),
			proxyTimeout: 8000,
			onReq: (req, { headers }) => {
				headers['x-forwarded-for'] = remoteIp
			}
		}, defaultWSHandler);
	} else {
		JLog.warn(`[Handler] ${remoteIp} ${pathname} GET: Invalid Response Received`);
		socket.destroy();
	}
}

JLog.log(`Handler server is ready.`);
Server.listen(80);
