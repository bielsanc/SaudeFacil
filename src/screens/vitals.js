import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import HealthHeader from '../components/HealthHeader';
import AppNavigation from '../components/AppNavigation';
import { api, mensagemErroApi } from '../services/api';

const NAVY = '#242A4D';
const CREAM = '#FFF7EB';
const dateNow = () => {
  const now = new Date();
  return { date: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`, time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` };
};
const num = (value) => Number(String(value).replace(',', '.'));
const parseMeasuredAt = (value) => new Date(String(value || '').replace(' ', 'T'));
const prettyDate = (value) => {
  const date = parseMeasuredAt(value);
  return Number.isNaN(date.getTime()) ? String(value || '') : date.toLocaleDateString('pt-BR');
};

export default function VitalsScreen({ navigation, route }) {
  const type = route.params?.type || 'pressure';
  const glucose = type === 'glucose';
  const path = glucose ? '/glucose' : '/pressure';
  const title = glucose ? 'Glicemia' : 'Pressão';
  const icon = glucose ? require('../../assets/glicemia.png') : require('../../assets/pressao.png');
  const subtitle = glucose ? 'Acompanhe seus níveis de glicose no sangue.' : 'Acompanhe seu histórico e cuide da sua saúde.';
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });
  const [mode, setMode] = useState('overview');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [range, setRange] = useState(7);
  const [form, setForm] = useState({ ...dateNow(), systolic: '', diastolic: '', heartRate: '', value: '', context: glucose ? 'Em jejum' : 'Em repouso', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get(path); setItems(data.records || []); }
    catch { Alert.alert('Histórico indisponível', 'Confira se a API está ativa e tente novamente.'); }
    finally { setLoading(false); }
  }, [path]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const reading = glucose ? num(form.value) : null;
    if (glucose ? !(reading > 0 && reading <= 1500) : !(num(form.systolic) > 0 && num(form.systolic) <= 400 && num(form.diastolic) > 0 && num(form.diastolic) <= 300)) {
      Alert.alert('Confira os valores', glucose ? 'Informe um valor de glicemia válido.' : 'Informe valores válidos para as pressões sistólica e diastólica.'); return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.date) || !/^\d{2}:\d{2}$/.test(form.time)) { Alert.alert('Data ou horário inválido', 'Use o formato exibido nos campos.'); return; }
    setSaving(true);
    try {
      const payload = glucose
        ? { value: reading, context: form.context, date: form.date, time: form.time, notes: form.notes }
        : { systolic: num(form.systolic), diastolic: num(form.diastolic), heartRate: form.heartRate ? num(form.heartRate) : null, context: form.context, date: form.date, time: form.time, notes: form.notes };
      await api.post(path, payload);
      setForm({ ...dateNow(), systolic: '', diastolic: '', heartRate: '', value: '', context: glucose ? 'Em jejum' : 'Em repouso', notes: '' });
      await load(); setMode('overview');
    } catch (error) { Alert.alert('Não foi possível salvar', mensagemErroApi(error) || 'Confira a conexão com a API e tente novamente.'); }
    finally { setSaving(false); }
  };

  if (!fontsLoaded) return <View style={styles.loading}><ActivityIndicator color={NAVY} /></View>;
  const latest = items[0];
  const shown = items.filter((item) => Date.now() - parseMeasuredAt(item.measuredAt).getTime() <= range * 86400000).slice(0, 8);

  return (
    <SafeAreaView style={styles.screen}>
      <HealthHeader title={mode === 'form' ? 'Nova medição' : title} subtitle={subtitle} icon={icon} overview={mode === 'overview'} onBack={() => setMode('overview')} />
      {mode === 'form' ? (
        <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.formIntro}><View style={styles.formIcon}><Ionicons name={glucose ? 'water' : 'heart'} size={25} color={glucose ? '#2788E5' : '#E7595B'} /></View><View style={{ flex: 1 }}><Text style={styles.formTitle}>{glucose ? 'Glicemia' : 'Pressão arterial'}</Text><Text style={styles.muted}>Preencha os dados para registrar sua medição.</Text></View></View>
          {glucose ? <Field label="Valor da glicemia (mg/dL)" placeholder="Ex: 98" value={form.value} onChangeText={(value) => setForm({ ...form, value })} keyboardType="decimal-pad" icon="water-outline" /> : <>
            <Field label="Pressão sistólica (mmHg)" placeholder="Ex: 120" value={form.systolic} onChangeText={(value) => setForm({ ...form, systolic: value })} keyboardType="decimal-pad" icon="heart-outline" />
            <Field label="Pressão diastólica (mmHg)" placeholder="Ex: 80" value={form.diastolic} onChangeText={(value) => setForm({ ...form, diastolic: value })} keyboardType="decimal-pad" icon="heart-outline" />
            <Field label="Frequência cardíaca (bpm) · opcional" placeholder="Ex: 72" value={form.heartRate} onChangeText={(value) => setForm({ ...form, heartRate: value })} keyboardType="decimal-pad" icon="heart-outline" />
          </>}
          <Text style={styles.fieldLabel}>Contexto da medição</Text>
          <View style={styles.options}>{(glucose ? ['Em jejum', 'Antes da refeição', '1–2h após refeição', 'Ao acaso'] : ['Em repouso', 'Após atividade', 'Outro']).map((option) => <Pressable key={option} onPress={() => setForm({ ...form, context: option })} style={[styles.option, form.context === option && styles.optionActive]}><Text style={[styles.optionText, form.context === option && styles.optionTextActive]}>{option}</Text></Pressable>)}</View>
          <View style={styles.row}><Field label="Data" placeholder="dd/mm/aaaa" value={form.date} onChangeText={(value) => setForm({ ...form, date: value })} icon="calendar-outline"/><Field label="Horário" placeholder="hh:mm" value={form.time} onChangeText={(value) => setForm({ ...form, time: value })} icon="time-outline"/></View>
          <Field label="Observações (opcional)" placeholder="Adicione uma observação..." value={form.notes} onChangeText={(value) => setForm({ ...form, notes: value })} multiline />
          <Pressable disabled={saving} onPress={save} style={styles.save}><Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar medição'}</Text></Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.sectionTitle}><Ionicons name={glucose ? 'water' : 'pulse'} size={19} color={NAVY}/><Text style={styles.cardTitle}>Última medição</Text></View>
            {loading ? <ActivityIndicator color={NAVY} /> : latest ? <><View style={styles.latestRow}><Text style={styles.value}>{glucose ? latest.value : `${latest.systolic}/${latest.diastolic}`}</Text><Text style={styles.unit}>{glucose ? 'mg/dL' : ' mmHg'}</Text></View><Text style={styles.metadata}>{prettyDate(latest.measuredAt)} · {parseMeasuredAt(latest.measuredAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}{glucose ? ` · ${latest.context}` : ''}</Text></> : <Text style={styles.empty}>Nenhuma medição registrada. Toque em + para começar.</Text>}
          </View>
          <View style={styles.card}>
            <View style={styles.chartHeader}><View style={styles.sectionTitle}><Ionicons name="bar-chart" size={18} color={NAVY}/><Text style={styles.cardTitle}>{glucose ? 'Resumo glicêmico' : 'Variação da pressão'}</Text></View><View style={styles.ranges}>{[7,30,90].map((days) => <Pressable key={days} onPress={() => setRange(days)} style={[styles.range, range === days && styles.rangeActive]}><Text style={[styles.rangeText, range === days && styles.rangeTextActive]}>{days}d</Text></Pressable>)}</View></View>
            <Chart records={shown} glucose={glucose} />
          </View>
          <View style={styles.card}><View style={styles.sectionTitle}><Ionicons name="time-outline" size={18} color={NAVY}/><Text style={styles.cardTitle}>Histórico de medições</Text></View>
            {loading ? <ActivityIndicator color={NAVY}/> : items.length ? items.slice(0,8).map((item) => <View key={item.id} style={styles.historyRow}><Text style={styles.historyDate}>{prettyDate(item.measuredAt)}</Text><Text style={styles.historyValue}>{glucose ? `${item.value} mg/dL` : `${item.systolic}/${item.diastolic} mmHg`}</Text></View>) : <Text style={styles.empty}>Suas medições salvas aparecerão aqui.</Text>}
          </View>
        </ScrollView>
      )}
      <AppNavigation onPressAdd={() => { setForm({ ...dateNow(), systolic: '', diastolic: '', heartRate: '', value: '', context: glucose ? 'Em jejum' : 'Em repouso', notes: '' }); setMode('form'); }} />
    </SafeAreaView>
  );
}

function Field({ label, ...props }) { return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><View style={[styles.inputWrap, props.multiline && styles.multiline]}><TextInput {...props} placeholderTextColor="#8E91A0" style={styles.input} />{props.icon ? <Ionicons name={props.icon} size={20} color={NAVY}/> : null}</View></View>; }
function Chart({ records, glucose }) {
  if (!records.length) return <View style={styles.chartEmpty}><Ionicons name="analytics-outline" size={28} color="#9A9BA5"/><Text style={styles.empty}>Registre medições para ver o gráfico.</Text></View>;
  const W=320,H=165,pad=24, values = records.slice().reverse().map((r) => glucose ? Number(r.value) : Number(r.systolic));
  const min=Math.min(...values), max=Math.max(...values), span=max-min || 1;
  const points=values.map((v,i)=>`${pad+i*((W-2*pad)/Math.max(values.length-1,1))},${H-pad-((v-min)/span)*(H-2*pad)}`).join(' ');
  return <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}><Rect x="0" y="0" width={W} height={H} fill="#FFFCF6" rx="12"/>{[0,1,2,3].map(i=><Line key={i} x1={pad} x2={W-pad} y1={pad+i*(H-2*pad)/3} y2={pad+i*(H-2*pad)/3} stroke="#EAE5DC"/>)}<Polyline points={points} fill="none" stroke="#292F56" strokeWidth="3"/>{points.split(' ').map((p,i)=>{const [cx,cy]=p.split(',');return <Circle key={i} cx={cx} cy={cy} r="4.5" fill="#292F56"/>})}</Svg>;
}

const styles = StyleSheet.create({screen:{flex:1,backgroundColor:'#F4F0E7'},loading:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:CREAM},content:{paddingHorizontal:16,paddingTop:16,paddingBottom:115,gap:12},card:{backgroundColor:'#FFFCF6',borderRadius:22,padding:16,shadowColor:'#292F56',shadowOpacity:.08,shadowRadius:10,elevation:3},sectionTitle:{flexDirection:'row',alignItems:'center',gap:8},cardTitle:{fontFamily:'Poppins_700Bold',fontSize:14,color:'#181D38'},latestRow:{flexDirection:'row',alignItems:'baseline',marginTop:8},value:{fontFamily:'Poppins_700Bold',fontSize:34,color:'#202645'},unit:{fontFamily:'Poppins_400Regular',fontSize:14,color:'#303650'},metadata:{fontFamily:'Poppins_400Regular',fontSize:12,color:'#777B88',marginTop:4},empty:{fontFamily:'Poppins_400Regular',fontSize:12,color:'#777B88',marginTop:10,lineHeight:18},chartHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:5,marginBottom:10},ranges:{flexDirection:'row',backgroundColor:'#F2EEE5',borderRadius:20,padding:2},range:{paddingHorizontal:8,paddingVertical:5,borderRadius:15},rangeActive:{backgroundColor:NAVY},rangeText:{fontFamily:'Poppins_400Regular',fontSize:10,color:'#35394F'},rangeTextActive:{color:'#FFF'},chartEmpty:{height:130,alignItems:'center',justifyContent:'center',gap:6},historyRow:{minHeight:42,borderBottomWidth:1,borderBottomColor:'#EFEAE1',flexDirection:'row',justifyContent:'space-between',alignItems:'center'},historyDate:{fontFamily:'Poppins_400Regular',fontSize:12,color:'#555A6A'},historyValue:{fontFamily:'Poppins_700Bold',fontSize:12,color:'#202645'},formContent:{paddingHorizontal:18,paddingTop:16,paddingBottom:120},formIntro:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:18},formIcon:{width:52,height:52,borderRadius:16,backgroundColor:'#EAF3F7',alignItems:'center',justifyContent:'center'},formTitle:{fontFamily:'Poppins_700Bold',fontSize:18,color:'#202645'},muted:{fontFamily:'Poppins_400Regular',fontSize:12,color:'#6E7280',lineHeight:18},fieldWrap:{flex:1,marginBottom:13},fieldLabel:{fontFamily:'Poppins_700Bold',fontSize:13,color:'#171B35',marginBottom:6},inputWrap:{minHeight:48,borderRadius:18,borderWidth:1,borderColor:'#EEE8DE',backgroundColor:'#FFFCF7',paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:6},multiline:{minHeight:82,alignItems:'flex-start',paddingTop:10},input:{flex:1,minWidth:0,fontFamily:'Poppins_400Regular',fontSize:13,color:'#202645',paddingVertical:10},options:{flexDirection:'row',flexWrap:'wrap',gap:7,marginBottom:12},option:{borderRadius:18,paddingVertical:9,paddingHorizontal:11,backgroundColor:'#FFFCF7',borderWidth:1,borderColor:'#EEE8DE'},optionActive:{backgroundColor:NAVY,borderColor:NAVY},optionText:{fontFamily:'Poppins_500Medium',fontSize:11,color:'#282D48'},optionTextActive:{color:'#FFF'},row:{flexDirection:'row',gap:10},save:{height:50,borderRadius:26,backgroundColor:NAVY,alignItems:'center',justifyContent:'center',marginTop:5},saveText:{fontFamily:'Poppins_700Bold',fontSize:15,color:'#FFF'}});
