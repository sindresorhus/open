'use strict';
var assert = require('assert');
var opn = require('./');

var chromeName;

if (process.platform === 'darwin') {
	chromeName = 'google chrome canary';
} else if (process.platform === 'linux') {
	chromeName = 'google-chrome';
} else if (process.platform === 'win32') {
	chromeName = 'Chrome';
}

// tests only checks that opening doesn't return an error
// it has no way make sure that it actually opened anything

// these have to be manually verified

it('should open file in default app', function () {
	opn('index.js');
});

it('should open url in default app', function (cb) {
	this.timeout(20000);

	opn('http://sindresorhus.com', process.platform === 'darwin' ? cb() : function (err) {
		assert.ifError(err);
		cb();
	});
});

it('should open url in specified app', function (cb) {
	this.timeout(20000);
	opn('http://sindresorhus.com', 'firefox', function (err) {
		assert.ifError(err);
		cb();
	});
});

it('should open url in specified app with arguments', function (cb) {
	this.timeout(20000);

	opn('http://sindresorhus.com', [chromeName, '--incognito'], function (err) {
		assert.ifError(err);
		cb();
	});
});
