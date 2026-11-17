import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from './Button';

const ACTIONS = [
  { label: 'Pressão arterial', icon: 'heart-outline', route: 'Pressao' },
  { label: 'Glicemia', icon: 'water-outline', route: 'Glicemia' },
  { label: 'IMC', icon: 'body-outline', route: 'IMC' },
  { label: 'Hidratação', icon: 'water', route: 'Agua' },
];

export default function AppNavigation({ onPressAdd }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [showActions, setShowActions] = useState(false);
  const active = route.name === 'Home' ? 'home' : route.name === 'Profile' ? 'profile' : '';
  const add = onPressAdd || (() => setShowActions(true));
  const go = (name) => { setShowActions(false); navigation.navigate(name); };

  return <>
    <View style={styles.bottomBar}>
      <Button variant="nav" onPress={() => go('Home')} icon={active === 'home' ? 'home' : 'home-outline'} iconSize={active === 'home' ? 20 : 24} color={active === 'home' ? '#F7F5EC' : '#262A3B'} iconContainerStyle={active === 'home' ? styles.navBtnActive : null} style={styles.navBtn} accessibilityRole="button" accessibilityLabel="Início" />
      <Button variant="nav" onPress={add} icon="add" iconSize={27} color="#F7F5EC" iconContainerStyle={styles.addBtn} style={styles.navBtn} accessibilityRole="button" accessibilityLabel="Adicionar registro" />
      <Button variant="nav" onPress={() => go('Profile')} icon={active === 'profile' ? 'person' : 'person-outline'} iconSize={active === 'profile' ? 20 : 22} color={active === 'profile' ? '#F7F5EC' : '#262A3B'} iconContainerStyle={active === 'profile' ? styles.navBtnActive : null} style={styles.navBtn} accessibilityRole="button" accessibilityLabel="Perfil" />
    </View>
    <Modal visible={showActions} transparent animationType="fade" onRequestClose={() => setShowActions(false)}>
      <Pressable style={styles.overlay} onPress={() => setShowActions(false)}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>O que deseja registrar?</Text>
          {ACTIONS.map((item) => <Pressable key={item.route} style={styles.action} onPress={() => go(item.route)} accessibilityRole="button"><View style={styles.actionIcon}><Ionicons name={item.icon} size={20} color="#242A4D" /></View><Text style={styles.actionText}>{item.label}</Text><Ionicons name="chevron-forward" size={18} color="#777B88" /></Pressable>)}
          <Pressable onPress={() => setShowActions(false)} style={styles.cancel}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
        </View>
      </Pressable>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  bottomBar:{position:'absolute',bottom:22,left:20,right:20,height:64,backgroundColor:'#FFF9EF',borderRadius:34,flexDirection:'row',justifyContent:'space-around',alignItems:'center',elevation:9,shadowColor:'#1E2136',shadowOffset:{width:0,height:5},shadowOpacity:.16,shadowRadius:12},
  navBtn:{minWidth:42,minHeight:42},navBtnActive:{width:38,height:38,borderRadius:19,backgroundColor:'#242A4D',alignItems:'center',justifyContent:'center'},addBtn:{width:44,height:44,borderRadius:22,backgroundColor:'#242A4D',alignItems:'center',justifyContent:'center'},
  overlay:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(20,24,43,0.35)'},sheet:{backgroundColor:'#FFF9EF',borderTopLeftRadius:26,borderTopRightRadius:26,paddingHorizontal:20,paddingTop:12,paddingBottom:28},sheetHandle:{alignSelf:'center',width:38,height:4,borderRadius:3,backgroundColor:'#D4D0C8',marginBottom:15},sheetTitle:{fontSize:17,color:'#242A4D',fontFamily:'Poppins_700Bold',marginBottom:10},action:{height:54,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderBottomColor:'#ECE7DE'},actionIcon:{width:36,height:36,borderRadius:12,backgroundColor:'#E8EFF3',alignItems:'center',justifyContent:'center',marginRight:12},actionText:{flex:1,color:'#242A4D',fontSize:14,fontFamily:'Poppins_500Medium'},cancel:{alignItems:'center',paddingVertical:14},cancelText:{color:'#555A6A',fontSize:13,fontFamily:'Poppins_500Medium'},
});
