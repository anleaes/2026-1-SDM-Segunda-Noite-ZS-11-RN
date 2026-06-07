import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const CustomDrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.header}>
        <Text style={styles.logo}>GC</Text>
        <Text style={styles.name}>Gestão de Contratos</Text>
        <Text style={styles.subtitle}>Cadastros e contratos</Text>
      </View>
      <View style={styles.list}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: { padding: 22, backgroundColor: '#1E5AA8', alignItems: 'center' },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', color: '#1E5AA8', textAlign: 'center', textAlignVertical: 'center', fontSize: 28, fontWeight: '900', marginBottom: 10 },
  name: { color: '#fff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#DCE9FF', fontSize: 12, marginTop: 4 },
  list: { flex: 1, paddingTop: 10 },
});

export default CustomDrawerContent;
