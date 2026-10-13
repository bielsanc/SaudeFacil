import React from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useFonts as usePoppins, Poppins_400Regular, Poppins_500Medium } from '@expo-google-fonts/poppins';
import { useFonts as useLibreBaskerville, LibreBaskerville_700Bold } from '@expo-google-fonts/libre-baskerville';
import Header from '../components/Header';
import CategoryCard from '../components/CategoryCard';
import BottomNavBar from '../components/BottomNavBar';

const categories = [
  { id: '1', title: 'Sangue', icon: require('../../assets/sangue.png') },
  { id: '2', title: 'Água', icon: require('../../assets/agua.png') },
  { id: '3', title: 'Remédio', icon: require('../../assets/remedio.png') },
  { id: '4', title: 'Alergia', icon: require('../../assets/alergia.png') },
  { id: '5', title: 'Glicemia', icon: require('../../assets/glicemia.png') },
  { id: '6', title: 'Pressão', icon: require('../../assets/pressao.png') },
  { id: '7', title: 'IMC', icon: require('../../assets/imc.png') },
  { id: '8', title: 'Vacinas', icon: require('../../assets/vacina.png') },
  { id: '9', title: 'Meditação', icon: require('../../assets/meditacao.png') },
  { id: '10', title: 'Fruta', icon: require('../../assets/fruta.png') },
  { id: '11', title: 'Dicas', icon: require('../../assets/dicas.png') },
  { id: '12', title: 'Emergência', icon: require('../../assets/emergencia.png') },
];

export default function HomeScreen({ navigation }) {
  const [poppinsLoaded] = usePoppins({ Poppins_400Regular, Poppins_500Medium });
  const [libreLoaded] = useLibreBaskerville({ LibreBaskerville_700Bold });

  const handleCardPress = (title) => {
    if (title === 'IMC') {
      navigation.navigate('IMC');
    } else if (title === 'Água') {
      navigation.navigate('Agua');
    } else if (title === 'Sangue') {
      navigation.navigate('Sangue');
    } else if (title === 'Fruta') {
      navigation.navigate('Fruta');
    } else {
      console.log(`Card ${title} clicado`);
    }
  };

  if (!poppinsLoaded || !libreLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#282B49" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header
          variant="home"
          userName="Bia"
          onOpenMenu={() => console.log('Menu aberto')}
          onOpenNotifications={() => console.log('Notificações abertas')}
        />

        <View style={styles.gridContainer}>
          <View style={styles.grid}>
            {categories.map((item) => (
              <CategoryCard
                key={item.id}
                title={item.title}
                icon={item.icon}
                onPress={() => handleCardPress(item.title)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNavBar
        active="home"
        onPressHome={() => console.log('Já está na Home')}
        onPressAdd={() => console.log('Adicionar item')}
        onPressProfile={() => navigation.navigate('Profile')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E4D9',
  },
  container: {
    flex: 1,
    backgroundColor: '#E8E4D9',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  // Altere apenas o gridContainer no StyleSheet do HomeScreen.js

gridContainer: {
  paddingHorizontal: 16,
  marginTop: -2, // Eleva o container bege em 2px para engolir a linha de junção
  paddingTop: 16,
},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

