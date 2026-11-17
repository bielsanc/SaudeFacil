import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import AppNavigation from '../components/AppNavigation';
export default function NotificationsScreen() { return <SafeAreaView style={styles.screen}><Header title="Notificações"/><View style={styles.content}><View style={styles.icon}><Ionicons name="notifications-outline" size={30} color="#242A4D"/></View><Text style={styles.title}>Tudo em dia</Text><Text style={styles.copy}>Suas notificações aparecerão aqui.</Text></View><AppNavigation/></SafeAreaView>; }
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#F4F0E7'},content:{flex:1,alignItems:'center',justifyContent:'center',paddingBottom:70},icon:{width:68,height:68,borderRadius:23,backgroundColor:'#E7EEF2',alignItems:'center',justifyContent:'center',marginBottom:14},title:{fontSize:19,color:'#242A4D',fontFamily:'Poppins_700Bold'},copy:{fontSize:13,color:'#747988',fontFamily:'Poppins_400Regular',marginTop:4}});
