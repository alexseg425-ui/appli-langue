import { StyleSheet, Text, View } from 'react-native';

// Écran provisoire de l'étape 1.1 : prouve que l'app se lance.
export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello Chispa 🦎</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7EC',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#3B2A1A' },
});
