import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';

const CustomDrawerContent = (props: any) => {
  const { logout, profile, username } = useAuth();
  const profileLabels = {
    ADMIN: 'Administrador',
    GERENTE: 'Gerente',
    FUNCIONARIO: 'Funcionário',
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.header}>
        <Text style={styles.logo}>GC</Text>
        <Text style={styles.name}>Gestão de Contratos</Text>
        <Text style={styles.subtitle}>{username}</Text>
        <Text style={styles.profile}>{profile ? profileLabels[profile] : ''}</Text>
      </View>
      <View style={styles.list}>
        <DrawerItemList {...props} />
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#A12727" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: { padding: 22, backgroundColor: '#1E5AA8', alignItems: 'center' },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', color: '#1E5AA8', textAlign: 'center', textAlignVertical: 'center', fontSize: 28, fontWeight: '900', marginBottom: 10 },
  name: { color: '#fff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#DCE9FF', fontSize: 12, marginTop: 4 },
  profile: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', marginTop: 3 },
  list: { flex: 1, paddingTop: 10 },
  footer: { borderTopColor: '#E7ECF3', borderTopWidth: 1, padding: 14 },
  logoutButton: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', gap: 10, minHeight: 44, paddingHorizontal: 10 },
  logoutText: { color: '#A12727', fontSize: 15, fontWeight: '800' },
});

export default CustomDrawerContent;
