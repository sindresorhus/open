import {expectType} from 'tsd';
import {ChildProcess} from 'child_process';
import open = require('.');

const options: open.Options = {};

expectType<Promise<ChildProcess>>(open('foo'));
expectType<Promise<ChildProcess>>(open('foo', {app: 'bar'}));
expectType<Promise<ChildProcess>>(open('foo', {app: ['bar', '--arg']}));
expectType<Promise<ChildProcess>>(open('foo', {wait: true}));
expectType<Promise<ChildProcess>>(open('foo', {background: true}));
expectType<Promise<ChildProcess>>(open('foo', {newWindow: true}));
expectType<Promise<ChildProcess>>(open('foo', {url: true}));
