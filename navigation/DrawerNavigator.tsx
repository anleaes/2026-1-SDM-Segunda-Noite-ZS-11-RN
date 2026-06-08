import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import CrudFormScreen from '../components/CrudFormScreen';
import CrudListScreen from '../components/CrudListScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import { drawerEntityKeys, entityConfigs } from '../constants/entities';
import HomeScreen from '../screens/HomeScreen';

export type DrawerParamList = {
  Home: undefined;
  EntityForm: { entityKey: string; item?: any };
  clientes: undefined;
  funcionarios: undefined;
  usuarios: undefined;
  canaisContato: undefined;
  categoriasContrato: undefined;
  servicos: undefined;
  contratos: undefined;
  itensContrato: undefined;
  pagamentos: undefined;
  documentos: undefined;
  notificacoes: undefined;
  auditorias: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const makeListScreen = (entityKey: string) => {
  return function EntityListScreen(props: any) {
    return <CrudListScreen {...props} config={entityConfigs[entityKey]} />;
  };
};

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerActiveTintColor: '#1E5AA8',
        drawerInactiveTintColor: '#34415A',
        drawerLabelStyle: { marginLeft: 0, fontSize: 15, fontWeight: '700' },
        drawerStyle: { backgroundColor: '#fff', width: 285 },

        headerStyle: { backgroundColor: '#1E5AA8' },
        headerTintColor: '#fff',

        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="home-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          title: 'Início',
        }}
      />

      {drawerEntityKeys.map((key) => {
        const config = entityConfigs[key];

        return (
          <Drawer.Screen
            key={key}
            name={key as keyof DrawerParamList}
            component={makeListScreen(key)}
            options={{
              drawerIcon: ({ color, size }) => (
                <Ionicons name={config.icon} size={size} color={color} />
              ),
              title: config.title,
            }}
          />
        );
      })}

      <Drawer.Screen
        name="EntityForm"
        component={CrudFormScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Cadastro',
        }}
      />
    </Drawer.Navigator>
  );
}
