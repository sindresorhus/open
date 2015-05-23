#!/usr/bin/env node
'use strict';
var meow = require('meow');
var opn = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ opn <file|url> [app]',
		'',
		'Example',
		'  $ opn http://sindresorhus.com',
		'  $ opn http://sindresorhus.com firefox',
		'  $ opn unicorn.png'
	].join('\n')
});

opn(cli.input[0], cli.input[1]);
