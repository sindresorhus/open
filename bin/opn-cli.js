#!/usr/bin/env node

var opn = require('../index.js');
var args = process.argv.slice(2);

if(!args[0])
	quit("opn need a URL to open");
	
if(args[1])
	opn(args[0], { app: args.slice(1) });
else
	opn(args[0]);

function quit(msg) {
	console.error(msg);
	process.exit(1)
}
