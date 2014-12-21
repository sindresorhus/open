'use strict';
var assert = require('assert');
var opn = require('./index');

// tests only checks that opening doesn't return an error
// it has no way make sure that it actually opened anything

// these have to be manually verified

describe('opn:', function () {
	it('should open file in default app', function (cb) {
		opn('index.js');
		cb();
	});

	it('should open url in default app', function (cb) {
		this.timeout(20000);

		opn('http://sindresorhus.com', process.platform === 'darwin' ? cb() : function (err) {
			assert.strictEqual(!err, true);
			cb();
		});
	});

	it('should open url in specified app', function (cb) {
		this.timeout(20000);
		opn('https://twitter.com/sindresorhus', 'google-chrome', function (err) {
			assert.strictEqual(!err, true);
			cb();
		});
	});

	it('should open url in specified app with arguments', function (cb) {
		this.timeout(20000);
		opn('https://github.com/regexps', ['google-chrome', '--incognito'], function (err) {
			assert.strictEqual(!err, true);
			cb();
		});
	});
});
