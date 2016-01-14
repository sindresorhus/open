import test from 'ava';
import m from './';

let chromeName;

if (process.platform === 'darwin') {
	chromeName = 'google chrome canary';
} else if (process.platform === 'linux') {
	chromeName = 'google-chrome';
} else if (process.platform === 'win32') {
	chromeName = 'Chrome';
}

// tests only checks that opening doesn't return an error
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
	await m('http://sindresorhus.com', {app: 'firefox'});
});

test('open url in specified app with arguments', async () => {
	await m('http://sindresorhus.com', {app: [chromeName, '--incognito']});
});

test('return the child process when called', async t => {
	const cp = await m('index.js');
	t.ok('stdout' in cp);
});
