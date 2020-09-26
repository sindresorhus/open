import test from 'ava';
import isWsl from 'is-wsl';
import open from '.';

let chromeName;
let firefoxName;
let chromeWslName;
let firefoxWslName;

if (process.platform === 'darwin') {
	chromeName = 'google chrome canary';
	firefoxName = 'firefox';
} else if (process.platform === 'win32' || isWsl) {
	chromeName = 'Chrome';
	firefoxName = 'C:\\Program Files\\Mozilla Firefox\\firefox.exe';
	chromeWslName = '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe';
	firefoxWslName = '/mnt/c/Program Files/Mozilla Firefox/firefox.exe';
} else if (process.platform === 'linux') {
	chromeName = 'google-chrome';
	firefoxName = 'firefox';
}

// Tests only checks that opening doesn't return an error
// it has no way make sure that it actually opened anything.

// These have to be manually verified.

test('open file in default app', async () => {
	await open('index.js');
});

test('wait for the app to close if wait: true', async () => {
	await open('https://sindresorhus.com', {wait: true});
});

test('encode URL if url: true', async () => {
	await open('https://sindresorhus.com', {url: true});
});

test('open URL in default app', async () => {
	await open('https://sindresorhus.com');
});

test('open URL in specified app', async () => {
	await open('https://sindresorhus.com', {app: firefoxName});
});

test('open URL in specified app with arguments', async () => {
	await open('https://sindresorhus.com', {app: [chromeName, '--incognito']});
});

test('return the child process when called', async t => {
	const cp = await open('index.js');
	t.true('stdout' in cp);
});

test('open URL with query strings', async () => {
	await open('https://sindresorhus.com/?abc=123&def=456');
});

test('open URL with a fragment', async () => {
	await open('https://sindresorhus.com#projects');
});

test('open URL with query strings and spaces', async () => {
	await open('https://sindresorhus.com/?abc=123&def=456&ghi=with spaces');
});

test('open URL with query strings and a fragment', async () => {
	await open('https://sindresorhus.com/?abc=123&def=456#projects');
});

test('open URL with query strings and pipes', async () => {
	await open('https://sindresorhus.com/?abc=123&def=456&ghi=w|i|t|h');
});

test('open URL with query strings, spaces, pipes and a fragment', async () => {
	await open('https://sindresorhus.com/?abc=123&def=456&ghi=w|i|t|h spaces#projects');
});

test('open URL with query strings and URL reserved characters', async () => {
	await open('https://httpbin.org/get?amp=%26&colon=%3A&comma=%2C&commat=%40&dollar=%24&equals=%3D&plus=%2B&quest=%3F&semi=%3B&sol=%2F');
});

test('open URL with query strings and URL reserved characters with `url` option', async () => {
	await open('https://httpbin.org/get?amp=%26&colon=%3A&comma=%2C&commat=%40&dollar=%24&equals=%3D&plus=%2B&quest=%3F&semi=%3B&sol=%2F', {url: true});
});

if (isWsl) {
	test('open URL in specified Windows app given a WSL path to the app', async () => {
		await open('https://sindresorhus.com', {app: firefoxWslName});
	});

	test('open URL in specified Windows app with arguments given a WSL path to the app', async () => {
		await open('https://sindresorhus.com', {app: [chromeWslName, '--incognito']});
	});

	test('open URL with query strings and spaces works with `url` option', async () => {
		await open('https://sindresorhus.com/?abc=123&def=456&ghi=with spaces', {url: true});
	});

	test('open URL with query strings works with `url` option', async () => {
		await open('https://sindresorhus.com/?abc=123&def=456', {url: true});
	});
}
