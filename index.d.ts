/// <reference types="node"/>
import {ChildProcess} from 'child_process';

declare namespace open {
	interface Options {
		/**
		Wait for the opened app to exit before fulfilling the promise. If `false` it's fulfilled immediately when opening the app.

		Note that it waits for the app to exit, not just for the window to close.

		On Windows, you have to explicitly specify an app for it to be able to wait.

		@default false
		*/
		readonly wait?: boolean;

		/**
		__macOS only__

		Do not bring the app to the foreground.

		@default false
		*/
		readonly background?: boolean;

		/**
	Specify the `name` of the app to open the `target` with and optionally, app `arguments`. `app` can be an array of apps to try to open and `name` can be an array of app names to try. If each app fails, the last error will be thrown.

	The app name is platform dependent. Don't hard code it in reusable modules. For example, Chrome is `google chrome` on macOS, `google-chrome` on Linux and `chrome` on Windows. If possible, use [`open.apps`](#openapps) which auto-detects the correct binary to use.

	You may also pass in the app's full path. For example on WSL, this can be `/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe` for the Windows installation of Chrome.
		*/
		readonly app?: App | readonly App[];

		/**
		Allow the opened app to exit with nonzero exit code when the `wait` option is `true`.

		We do not recommend setting this option. The convention for success is exit code zero.

		@default false
		*/
		readonly allowNonzeroExitCode?: boolean;
	}

	type App = {name: string | readonly string[]; arguments?: readonly string[]};
}

declare const open: {
	/**
	An object containing auto-detected binary names for common apps. Useful to work around cross-platform issues.

	@example
	```
	import open = require('open');

	await open('https://google.com', {
		app: {
			name: open.apps.chrome
		}
	});
	```
	*/
	apps: Record<string, string | string[]>;

	/**
	Open stuff like URLs, files, executables. Cross-platform.

	Uses the command `open` on OS X, `start` on Windows and `xdg-open` on other platforms.

	There is a caveat for [double-quotes on Windows](https://github.com/sindresorhus/open#double-quotes-on-windows) where all double-quotes are stripped from the `target`.

	@param target - The thing you want to open. Can be a URL, file, or executable. Opens in the default app for the file type. For example, URLs open in your default browser.
	@returns The [spawned child process](https://nodejs.org/api/child_process.html#child_process_class_childprocess). You would normally not need to use this for anything, but it can be useful if you'd like to attach custom event listeners or perform other operations directly on the spawned process.

	@example
	```
	import open = require('open');

	// Opens the image in the default image viewer
	await open('unicorn.png', {wait: true});
	console.log('The image viewer app closed');

	// Opens the url in the default browser
	await open('https://sindresorhus.com');

	// Specify the app to open in
	await open('https://sindresorhus.com', {app: 'firefox'});

	// Specify app arguments
	await open('https://sindresorhus.com', {app: ['google chrome', '--incognito']});
	```
	*/
	(
		target: string,
		options?: open.Options
	): Promise<ChildProcess>;
};

export = open;
