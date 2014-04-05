#!/usr/bin/env node
'use strict';
var pkg = require('./package.json');
var opn = require('./index');

function help() {
	console.log(pkg.description);
	console.log('');
	console.log('Usage');
	console.log('  $ opn <file|url> [app]');
	console.log('');
	console.log('Example');
	console.log('  $ opn http://sindresorhus.com');
	console.log('  $ opn http://sindresorhus.com firefox');
	console.log('  $ opn unicorn.png');
}

if (process.argv.indexOf('-h') !== -1 || process.argv.indexOf('--help') !== -1) {
	help();
	return;
}

if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

opn(process.argv[2], process.argv[3]);
