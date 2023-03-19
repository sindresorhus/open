import {expectType} from 'tsd';
import {ChildProcess} from 'child_process';
import open from '.';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const options: open.Options = {};

expectType<Promise<ChildProcess>>(open('foo'));
expectType<Promise<ChildProcess>>(open('foo', {app: {
	name: 'bar'
}}));
expectType<Promise<ChildProcess>>(open('foo', {app: {
	name: 'bar',
	arguments: ['--arg']
}}));
expectType<Promise<ChildProcess>>(open('foo', {wait: true}));
expectType<Promise<ChildProcess>>(open('foo', {background: true}));
