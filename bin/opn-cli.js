#!/usr/bin/env node

var opn = require('../index.js');
var args = process.argv.slice(2);
var url = require('url');
var uri;

if(!args[0])
	quit('opn need a URL to open');

uri = url.parse(args[0])

if(!uri.protocol)
	uri = url.parse('http://' + args[0]);

if(!uri.hostname)
	quit('opn can not open an invalid URL: "', args[0] + '"');

uri = url.format(uri);

if(args[1])
	opn(uri, { app: args.slice(1) });
else
	opn(uri);

function quit(/* arguments */) {
	console.error(([].slice.apply(arguments)).join(''));
	process.exit(1)
}
