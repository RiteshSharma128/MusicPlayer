// /**
//  * @format
//  */
// import { AppRegistry } from 'react-native';
// import TrackPlayer from '@rntp/player';
// import App from './App';
// import { PlaybackService } from './src/PlaybackService';
// import { name as appName } from './app.json';

const { AppRegistry } = require('react-native');

function diagRequire(label, fn) {
  try {
    fn();
    console.log(`[DIAG] OK: ${label}`);
  } catch (e) {
    console.log(`[DIAG] FAILED: ${label} -> ${e && e.message}`);
  }
}
diagRequire('react-native-safe-area-context', () =>
  require('react-native-safe-area-context'),
);
diagRequire('react-native-svg', () => require('react-native-svg'));
diagRequire('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage'),
);
diagRequire('@nodefinity/react-native-music-library', () =>
  require('@nodefinity/react-native-music-library'),
);
diagRequire('@rntp/player', () => require('@rntp/player'));


const TrackPlayer = require('@rntp/player').default;
const App = require('./App').default;
const { PlaybackService } = require('./src/PlaybackService');
const { name: appName } = require('./app.json');

AppRegistry.registerComponent(appName, () => App);

