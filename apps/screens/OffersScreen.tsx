import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OffersScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Offers</Text>
      {/* Placeholder content - list of offers would go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09050F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
});
