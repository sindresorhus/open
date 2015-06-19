'use strict';
var path = require('path');
var childProcess = require('child_process');

module.exports = function (target, app, cb) {
	if (typeof target !== 'string') {
		throw new Error('Expected a `target`');
	}

	if (typeof app === 'function') {
		cb = app;
		app = null;
	}

	var cmd;
	var appArgs;
	var args = [];

	if (Array.isArray(app)) {
		appArgs = app.slice(1);
		app = app[0];
	}

	if (process.platform === 'darwin') {
		cmd = 'open';

		if (cb) {
			args.push('-W');
		}

		if (app) {
			args.push('-a', app);
		}

		if (appArgs) {
			args.push('--args')
			args = args.concat(appArgs);
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

		if (appArgs) {
			args = args.concat(appArgs);
		}
	} else {
		if (app) {
			cmd = app;
		} else {
			cmd = path.join(__dirname, 'xdg-open');
		}

		if (appArgs) {
			args = args.concat(appArgs);
		}
	}

	args.push(target);

	var opts = {};

	if (!cb) {
		// xdg-open will block the process unless stdio is ignored even if it's unref()'d
		opts.stdio = 'ignore';
	}

	var cp = childProcess.spawn(cmd, args, opts);

	if (cb) {
		cp.once('error', cb);

		cp.once('close', function (code) {
			if (code > 0) {
				cb(new Error('Exited with code ' + code));
				return;
			}

			cb();
		});
	} else {
		cp.unref();
	}

	return cp;
};
