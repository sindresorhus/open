#!/usr/bin/env node
'use strict';
var meow = require('meow');
var opn = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ opn <file|url> [app] [app arguments]',
		'',
		'Example',
		'  $ opn http://sindresorhus.com',
		'  $ opn http://sindresorhus.com firefox',
		'  $ opn http://sindresorhus.com \'google chrome\' --incognito',
		'  $ opn unicorn.png'
	]
});

opn(cli.input[0], process.argv.slice(3));
