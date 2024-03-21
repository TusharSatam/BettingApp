import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import SnakeLadders from './src/Games/Snake&Ladders/SnakeLadders';

function App(): React.JSX.Element {
  return (
    <View style={styles.AppContainer}>
      <SnakeLadders />
    </View>
  );
}

const styles = StyleSheet.create({
  AppContainer: {
    backgroundColor: 'red',
    height: '100%',
    width: '100%',
    color: 'black',
  },
});

export default App;
