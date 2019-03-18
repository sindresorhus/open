'use strict';
const path = require('path');
const childProcess = require('child_process');
const util = require('util');
const isWsl = require('is-wsl');

// Converts a path from WSL format to Windows format
// e.g. /mnt/c/Program Files/Example/MyApp.exe
//   => C:\Program Files\Example\MyApp.exe
const wslToWindowsPath = async path => {
	const { stdout, stderr } = await util.promisify(childProcess.execFile)('wslpath', ['-w', path]);
	return stdout.toString().trim();
}

module.exports = async (target, options) => {
	if (typeof target !== 'string') {
		throw new TypeError('Expected a `target`');
	}

	options = {
		wait: true,
		...options
	};

	let command;
	let appArguments = [];
	const cliArguments = [];
	const childProcessOptions = {};

	if (Array.isArray(options.app)) {
		appArguments = options.app.slice(1);
		options.app = options.app[0];
	}

	if (process.platform === 'darwin') {
		command = 'open';

		if (options.wait) {
			cliArguments.push('-W');
		}

		if (options.app) {
			cliArguments.push('-a', options.app);
		}
	} else if (process.platform === 'win32' || isWsl) {
		command = 'cmd' + (isWsl ? '.exe' : '');
		cliArguments.push('/c', 'start', '""', '/b');
		target = target.replace(/&/g, '^&');

		if (options.wait) {
			cliArguments.push('/wait');
		}

		if (options.app) {
			if (isWsl && options.app.startsWith('/mnt/')) {
				options.app = await wslToWindowsPath(options.app);
			}
			cliArguments.push(options.app);
		}

		if (appArguments.length > 0) {
			cliArguments.push(...appArguments);
		}
	} else {
		if (options.app) {
			command = options.app;
		} else {
			const useSystemXdgOpen = process.versions.electron || process.platform === 'android';
			command = useSystemXdgOpen ? 'xdg-open' : path.join(__dirname, 'xdg-open');
		}

		if (appArguments.length > 0) {
			cliArguments.push(...appArguments);
		}

		if (!options.wait) {
			// `xdg-open` will block the process unless stdio is ignored
			// and it's detached from the parent even if it's unref'd.
			childProcessOptions.stdio = 'ignore';
			childProcessOptions.detached = true;
		}
	}

	cliArguments.push(target);

	if (process.platform === 'darwin' && appArguments.length > 0) {
		cliArguments.push('--args', ...appArguments);
	}

	const cp = childProcess.spawn(command, cliArguments, childProcessOptions);

	if (options.wait) {
		return new Promise((resolve, reject) => {
			cp.once('error', reject);

			cp.once('close', exitCode => {
				if (exitCode > 0) {
					reject(new Error(`Exited with code ${exitCode}`));
					return;
				}

				resolve(cp);
			});
		});
	}

	cp.unref();

	return Promise.resolve(cp);
};
