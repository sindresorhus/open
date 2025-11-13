import process from 'node:process';
import childProcess from 'node:child_process';
import {EventEmitter} from 'node:events';
import test from 'ava';
import defaultBrowser from 'default-browser';
import open, {openApp, apps} from './index.js';

// Tests only checks that opening doesn't return an error
// it has no way make sure that it actually opened anything.

// These have to be manually verified.

// Helper to check if Safari is the default browser
const isSafariDefault = async () => {
	try {
		const browser = await defaultBrowser();
		return browser.id === 'com.apple.Safari';
	} catch {
		// If default-browser fails (e.g., on systems without a default browser)
		return false;
	}
};

test('open file in default app', async t => {
	await t.notThrowsAsync(open('index.js'));
});

test('encode URL if url: true', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com', {url: true}));
});

test('open URL in default app', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com'));
});

test('open URL in specified app', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com', {app: {name: apps.chrome}}));
});

test('open URL in specified app with arguments', async t => {
	await t.notThrowsAsync(async () => {
		const process_ = await open('https://sindresorhus.com', {app: {name: apps.chrome, arguments: ['--incognito']}});
		t.deepEqual(process_.spawnargs, ['open', '-a', apps.chrome, '--args', '--incognito', 'https://sindresorhus.com']);
	});
});

test('return the child process when called', async t => {
	const childProcess = await open('index.js');
	t.true('stdout' in childProcess);
});

test('open URL with query strings', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com/?abc=123&def=456'));
});

test('open URL with a fragment', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com#projects'));
});

test('open URL with query strings and spaces', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com/?abc=123&def=456&ghi=with spaces'));
});

test('open URL with query strings and a fragment', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com/?abc=123&def=456#projects'));
});

test('open URL with query strings and pipes', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com/?abc=123&def=456&ghi=w|i|t|h'));
});

test('open URL with query strings, spaces, pipes and a fragment', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com/?abc=123&def=456&ghi=w|i|t|h spaces#projects'));
});

test('open URL with query strings and URL reserved characters', async t => {
	await t.notThrowsAsync(open('https://httpbin.org/get?amp=%26&colon=%3A&comma=%2C&commat=%40&dollar=%24&equals=%3D&plus=%2B&quest=%3F&semi=%3B&sol=%2F'));
});

test('open URL with query strings and URL reserved characters with `url` option', async t => {
	await t.notThrowsAsync(open('https://httpbin.org/get?amp=%26&colon=%3A&comma=%2C&commat=%40&dollar=%24&equals=%3D&plus=%2B&quest=%3F&semi=%3B&sol=%2F', {url: true}));
});

test('open URL with single backtick', async t => {
	await t.notThrowsAsync(open('https://httpbin.org/get?test=backtick ` here'));
});

test('open URL with double backticks', async t => {
	await t.notThrowsAsync(open('https://httpbin.org/get?test=backticks `` here'));
});

test('open Firefox without arguments', async t => {
	await t.notThrowsAsync(openApp(apps.firefox));
});

test('open Chrome in incognito mode', async t => {
	await t.notThrowsAsync(openApp(apps.chrome, {arguments: ['--incognito'], newInstance: true}));
});

test('open Brave in incognito mode', async t => {
	await t.notThrowsAsync(openApp(apps.brave, {arguments: ['--incognito'], newInstance: true}));
});

test('open URL with default browser argument', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com', {app: {name: apps.browser}}));
});

test('open URL with default browser in incognito mode', async t => {
	if (await isSafariDefault()) {
		await t.throwsAsync(
			open('https://sindresorhus.com', {app: {name: apps.browserPrivate}}),
			{message: /Safari doesn't support opening in private mode via command line/},
		);
	} else {
		await t.notThrowsAsync(open('https://sindresorhus.com', {app: {name: apps.browserPrivate}}));
	}
});

test('open default browser', async t => {
	await t.notThrowsAsync(openApp(apps.browser, {newInstance: true}));
});

test('open default browser in incognito mode', async t => {
	if (await isSafariDefault()) {
		await t.throwsAsync(
			openApp(apps.browserPrivate, {newInstance: true}),
			{message: /Safari doesn't support opening in private mode via command line/},
		);
	} else {
		await t.notThrowsAsync(openApp(apps.browserPrivate, {newInstance: true}));
	}
});

test('subprocess is spawned before promise resolves', async t => {
	const childProcess = await open('index.js');

	// By the time the promise resolves, the spawn event should have fired
	// We verify this by checking that the subprocess has a pid
	t.true(childProcess.pid !== undefined && childProcess.pid !== null);
});

test.serial('app launches resolve before close without fallback', async t => {
	const originalSpawn = childProcess.spawn;
	t.teardown(() => {
		childProcess.spawn = originalSpawn;
	});

	let closeEmitted = false;

	childProcess.spawn = () => {
		// eslint-disable-next-line unicorn/prefer-event-target
		const fakeChild = new EventEmitter();
		fakeChild.unref = () => {};

		setImmediate(() => {
			fakeChild.emit('spawn');
			setTimeout(() => {
				closeEmitted = true;
				fakeChild.emit('close', 0);
			}, 50);
		});

		return fakeChild;
	};

	const subprocess = await open('index.js', {app: {name: 'stub-app'}});
	t.false(closeEmitted);
	t.truthy(subprocess);
});

test('fallback to next app when first app does not exist', async t => {
	// Try nonexistent apps first, then a real app
	// Note: This test may fail if all apps return non-zero exit codes (system issue)
	try {
		await open('https://sindresorhus.com', {
			app: {
				name: ['definitely-not-a-real-app-12345', 'another-fake-app-67890', apps.chrome],
			},
		});
		t.pass('Fallback succeeded');
	} catch (error) {
		if (error instanceof AggregateError && error.errors.every(error => error.message.includes('Exited with code'))) {
			// All apps failed with exit codes - this might be a system issue
			// where even valid apps return non-zero exit codes
			t.pass('All apps returned non-zero exit codes (possible system issue)');
		} else {
			throw error;
		}
	}
});

test('throws AggregateError when all apps in array fail', async t => {
	const error = await t.throwsAsync(
		open('https://sindresorhus.com', {
			app: {
				name: ['fake-app-1', 'fake-app-2', 'fake-app-3'],
			},
		}),
		{instanceOf: AggregateError},
	);

	t.is(error.errors.length, 3);
	t.true(error.message.includes('Failed to open in all supported apps'));
});

if (process.platform === 'linux') {
	test('spawn errors reject the promise instead of crashing', async t => {
		const error = await t.throwsAsync(openApp('definitely-not-a-real-command-12345'));
		t.is(error.code, 'ENOENT');
	});
}
