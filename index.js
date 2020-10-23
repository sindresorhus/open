'use strict';
const {promisify} = require('util');
const path = require('path');
const childProcess = require('child_process');
const fs = require('fs');
const isWsl = require('is-wsl');
const isDocker = require('is-docker');

const pAccess = promisify(fs.access);
const pExecFile = promisify(childProcess.execFile);
const pReaddir = promisify(fs.readdir);

// Path to included `xdg-open`.
const localXdgOpenPath = path.join(__dirname, 'xdg-open');

// Convert a path from WSL format to Windows format:
// `/mnt/c/Program Files/Example/MyApp.exe` → `C:\Program Files\Example\MyApp.exe`
const wslToWindowsPath = async path => {
	const {stdout} = await pExecFile('wslpath', ['-w', path]);
	return stdout.trim();
};

// Get the directory where fixed drives are automatically mounted in WSL
const wslAutoMountRoot = async () => {
	let rootDirectory = '/mnt/';
	try {
		const {stdout} = await pExecFile('awk', [
			'-F',
			'=',
			'/root/ {print $2}',
			'/etc/wsl.conf' // Path to per distro launch settings for WSL
		]);
		rootDirectory = stdout.trim();
	} catch (_) {}

	// Make sure it always ends with a slash
	if (!rootDirectory.endsWith('/')) {
		rootDirectory += '/';
	}

	return rootDirectory;
};

// Search for the Windows install directory in WSL
const wslSystemDirectory = async () => {
	const rootDirectory = await wslAutoMountRoot();
	let systemDrive = 'c';
	const systemDirectory = '/Windows/System32';

	try {
		// List the contents of the root directory.
		const paths = await pReaddir(rootDirectory);

		/* eslint-disable no-await-in-loop */
		for (const path of paths) {
			await pAccess(`${path}${systemDirectory}`, fs.constants.R_OK);
			systemDrive = path;
			break;
		}
		/* eslint-enable no-await-in-loop */
	} catch (_) {}

	return rootDirectory + systemDrive + systemDirectory;
};

module.exports = async (target, options) => {
	if (typeof target !== 'string') {
		throw new TypeError('Expected a `target`');
	}

	options = {
		wait: false,
		background: false,
		allowNonzeroExitCode: false,
		...options
	};

	let command;
	let {app} = options;
	let appArguments = [];
	const cliArguments = [];
	const childProcessOptions = {};

	if (Array.isArray(app)) {
		appArguments = app.slice(1);
		app = app[0];
	}

	if (process.platform === 'darwin') {
		command = 'open';

		if (options.wait) {
			cliArguments.push('--wait-apps');
		}

		if (options.background) {
			cliArguments.push('--background');
		}

		if (app) {
			cliArguments.push('-a', app);
		}
	} else if (process.platform === 'win32' || (isWsl && !isDocker())) {
		const systemDirectory = isWsl ? await wslSystemDirectory() : String.raw`${process.env.SYSTEMROOT}\System32`;
		command = String.raw`${[systemDirectory, 'WindowsPowerShell', 'v1.0', 'powershell'].join(isWsl ? '/' : '\\')}${isWsl ? '.exe' : ''}`;
		cliArguments.push(
			'-NoProfile',
			'-NonInteractive',
			'–ExecutionPolicy',
			'Bypass',
			'-EncodedCommand'
		);

		if (!isWsl) {
			childProcessOptions.windowsVerbatimArguments = true;
		}

		const encodedArguments = ['Start'];

		if (options.wait) {
			encodedArguments.push('-Wait');
		}

		if (app) {
			if (isWsl && app.startsWith('/mnt/')) {
				const windowsPath = await wslToWindowsPath(app);
				app = windowsPath;
			}

			// Double quote with double quotes to ensure the inner quotes are passed through.
			// Inner quotes are delimited for PowerShell interpretation with backticks.
			encodedArguments.push(`"\`"${app}\`""`, '-ArgumentList');
			appArguments.unshift(target);
		} else {
			encodedArguments.push(`"\`"${target}\`""`);
		}

		if (appArguments.length > 0) {
			appArguments = appArguments.map(arg => `"\`"${arg}\`""`);
			encodedArguments.push(appArguments.join(','));
		}

		// Using Base64-encoded command, accepted by PowerShell, to allow special characters.
		target = Buffer.from(encodedArguments.join(' '), 'utf16le').toString('base64');
	} else {
		if (app) {
			command = app;
		} else {
			// When bundled by Webpack, there's no actual package file path and no local `xdg-open`.
			const isBundled = !__dirname || __dirname === '/';

			// Check if local `xdg-open` exists and is executable.
			let exeLocalXdgOpen = false;
			try {
				await pAccess(localXdgOpenPath, fs.constants.X_OK);
				exeLocalXdgOpen = true;
			} catch (_) {}

			const useSystemXdgOpen = process.versions.electron ||
				process.platform === 'android' || isBundled || !exeLocalXdgOpen;
			command = useSystemXdgOpen ? 'xdg-open' : localXdgOpenPath;
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

	const subprocess = childProcess.spawn(command, cliArguments, childProcessOptions);

	if (options.wait) {
		return new Promise((resolve, reject) => {
			subprocess.once('error', reject);

			subprocess.once('close', exitCode => {
				if (options.allowNonzeroExitCode && exitCode > 0) {
					reject(new Error(`Exited with code ${exitCode}`));
					return;
				}

				resolve(subprocess);
			});
		});
	}

	subprocess.unref();

	return subprocess;
};
