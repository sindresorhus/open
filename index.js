'use strict';
var execFile = require('child_process').execFile;

module.exports = function (target, app, cb) {
	if (typeof target !== 'string') {
		throw new Error('Expected a `target`');
	}

	if (typeof app === 'function') {
		cb = app;
		app = null;
	}

	var cmd;
	var args = [];

	if (process.platform === 'darwin') {
		cmd = 'open';
		args.push('-W');

		if (app) {
			args.push('-a', app);
		}
	} else if (process.platform === 'win32') {
		cmd = 'cmd';
		args.push('/c', 'start', '/wait');

		if (app) {
			args.push(app);
		}
	} else {
		if (app) {
			cmd = app;
		} else {
			// http://portland.freedesktop.org/download/xdg-utils-1.1.0-rc1.tar.gz
			cmd = './xdg-open';
		}
	}

	args.push(target);

	execFile(cmd, args, cb);
};
