import test from 'ava';
import open, {openApp, apps} from './index.js';

// Tests only checks that opening doesn't return an error
// it has no way make sure that it actually opened anything.

// These have to be manually verified.

test('open file in default app', async t => {
	await t.notThrowsAsync(open('index.js'));
});

test('wait for the app to close if wait: true', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com', {wait: true}));
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
		const proc = await open('https://sindresorhus.com', {app: {name: apps.chrome, arguments: ['--incognito']}});
		t.deepEqual(proc.spawnargs, ['open', '-a', apps.chrome, 'https://sindresorhus.com', '--args', '--incognito']);
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

test('open Firefox without arguments', async t => {
	await t.notThrowsAsync(openApp(apps.firefox));
});

test('open Chrome in incognito mode', async t => {
	await t.notThrowsAsync(openApp(apps.chrome, {arguments: ['--incognito'], newInstance: true}));
});

test('open URL with default browser argument', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com', {app: {name: apps.browser}}));
});

test('open URL with default browser in incognito mode', async t => {
	await t.notThrowsAsync(open('https://sindresorhus.com', {app: {name: apps.browserPrivate}}));
});

test('open default browser', async t => {
	await t.notThrowsAsync(openApp(apps.browser, {newInstance: true}));
});

test('open default browser in incognito mode', async t => {
	await t.notThrowsAsync(openApp(apps.browserPrivate, {newInstance: true}));
});
