import test from 'ava';

// Regression: browser ids that collide with Object.prototype keys must be
// rejected as unsupported instead of resolving to a function via the
// prototype chain (`browser.id in ids` was true for e.g. "constructor").
test('prototype keys do not pass an Object.hasOwn check', t => {
	const ids = {};

	for (const key of ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__']) {
		t.false(Object.hasOwn(ids, key), `own-check must fail for ${key}`);
	}

	t.true(Object.hasOwn({'com.google.chrome': 'chrome'}, 'com.google.chrome'));
});
