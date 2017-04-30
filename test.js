import test from 'ava';
import isWsl from 'is-wsl';
import m from '.';

let chromeName;
let firefoxName;

if (process.platform === 'darwin') {
	chromeName = 'google chrome canary';
	firefoxName = 'firefox';
} else if (process.platform === 'win32' || isWsl) {
	chromeName = 'Chrome';
	firefoxName = 'C:\\Program Files\\Mozilla Firefox\\firefox.exe';
} else if (process.platform === 'linux') {
	chromeName = 'google-chrome';
	firefoxName = 'firefox';
}

// Tests only checks that opening doesn't return an error
// it has no way make sure that it actually opened anything

// these have to be manually verified

test('open file in default app', async () => {
	await m('index.js');
});

test('not wait for the app to close if wait: false', async () => {
	await m('http://sindresorhus.com', {wait: false});
});

test('open url in default app', async () => {
	await m('http://sindresorhus.com');
});

test('open url in specified app', async () => {
	await m('http://sindresorhus.com', {app: firefoxName});
});

test('open url in specified app with arguments', async () => {
	await m('http://sindresorhus.com', {app: [chromeName, '--incognito']});
});

test('return the child process when called', async t => {
	const cp = await m('index.js');
	t.true('stdout' in cp);
});
