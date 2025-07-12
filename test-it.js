import open, {apps, openApp} from 'open';

await open('https://brave.com', {app: {name: apps.brave}});
await openApp(apps.brave, {arguments: ['https://brave.com', '--incognito'], newInstance: true});
