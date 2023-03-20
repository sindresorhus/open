import {type ChildProcess} from 'node:child_process';
import {expectType} from 'tsd';
import open from './index.js';

expectType<Promise<ChildProcess>>(open('foo'));
expectType<Promise<ChildProcess>>(open('foo', {app: {
	name: 'bar',
}}));
expectType<Promise<ChildProcess>>(open('foo', {app: {
	name: 'bar',
	arguments: ['--arg'],
}}));
expectType<Promise<ChildProcess>>(open('foo', {wait: true}));
expectType<Promise<ChildProcess>>(open('foo', {background: true}));
