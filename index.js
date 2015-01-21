'use strict';
var path = require('path');
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
    var app_args = [];
    if (app instanceof Array) { app_args = app.splice(1); app = app[0] }

	if (process.platform === 'darwin') {
		cmd = 'open';

		if (cb) {
			args.push('-W');
		}

		if (app) {
			args.push('-a', app);
		}
	} else if (process.platform === 'win32') {
		cmd = 'cmd';
		args.push('/c', 'start');
		target = target.replace(/&/g, '^&');

		if (cb) {
			args.push('/wait');
		}

		if (app) {
			args.push(app);
		}
	} else {
		if (app) {
			cmd = app;
		} else {
			// http://portland.freedesktop.org/download/xdg-utils-1.1.0-rc1.tar.gz
			cmd = path.join(__dirname, 'xdg-open');
		}
	}

    args = args.concat(app_args);
	args.push(target);

	// xdg-open will block the process unless stdio is ignored
	execFile(cmd, args, {stdio: 'ignore'}, cb);
};
