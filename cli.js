#!/usr/bin/env node
'use strict';
var pkg = require('./package.json');
var opn = require('./');
var args = process.argv.slice(2);

function help() {
	console.log([
		pkg.description,
		'',
		'Usage',
		'  $ opn <file|url> [app] [app arguments]',
		'',
		'Example',
		'  $ opn http://sindresorhus.com',
		'  $ opn http://sindresorhus.com firefox',
  		'  $ opn http://sindresorhus.com google-chrome --incognito',
		'  $ opn unicorn.png'
	].join('\n'));
}

if (args.indexOf('--help') !== -1) {
	help();
	return;
}

if (args.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

opn(args.shift(), [args.shift(), args], function (err) {
	if (err) {
		console.error(err);
	}
});
