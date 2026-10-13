const { spawn } = require('node:child_process');
const path = require('node:path');

const proxy = spawn(process.execPath, [path.join(__dirname, 'fruityvice-proxy.js')], {
  stdio: 'inherit',
  env: process.env,
});
const expoCli = path.resolve(__dirname, '../node_modules/expo/bin/cli');
const expo = spawn(process.execPath, [expoCli, 'start', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});
let stopping = false;

function stopOthers(closedChild, exitCode) {
  if (stopping) return;
  stopping = true;
  if (closedChild !== proxy) proxy.kill();
  if (closedChild !== expo) expo.kill();
  process.exitCode = exitCode || 0;
}

proxy.on('error', (error) => {
  console.error('Could not start the Fruityvice proxy:', error.message);
  stopOthers(proxy, 1);
});
expo.on('error', (error) => {
  console.error('Could not start Expo:', error.message);
  stopOthers(expo, 1);
});
proxy.on('exit', (code) => {
  if (code !== 0) stopOthers(proxy, code);
});
expo.on('exit', (code) => stopOthers(expo, code));

process.on('SIGINT', () => stopOthers(null, 0));
process.on('SIGTERM', () => stopOthers(null, 0));
