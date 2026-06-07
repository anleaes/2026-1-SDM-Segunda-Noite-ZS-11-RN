import { Ionicons } from '@expo/vector-icons';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EntityConfig } from '../constants/entities';
import { DrawerParamList } from '../navigation/DrawerNavigator';
import { apiDelete, apiList } from '../services/api';

type Props = DrawerScreenProps<DrawerParamList, any> & {
  config: EntityConfig;
};

type RelationMaps = Record<string, Record<string, string>>;

const formatValue = (value: any) => {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

export default function CrudListScreen({ navigation, config }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [relationMaps, setRelationMaps] = useState<RelationMaps>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getFieldConfig = (fieldName: string) => {
    return config.fields.find(field => field.name === fieldName);
  };

  const getDisplayValue = (item: any, fieldName: string) => {
    const value = item[fieldName];
    const fieldConfig = getFieldConfig(fieldName);

    if (fieldConfig?.relation) {
      if (Array.isArray(value)) {
        return value
          .map(id => relationMaps[fieldName]?.[String(id)] ?? id)
          .join(', ');
      }

      return relationMaps[fieldName]?.[String(value)] ?? value;
    }

    return value;
  };

  const fetchRelations = async () => {
    const fieldsWithRelation = config.fields.filter(field => field.relation);
    const maps: RelationMaps = {};

    for (const field of fieldsWithRelation) {
      if (!field.relation) continue;

      const data = await apiList(field.relation.endpoint);
      const records = Array.isArray(data) ? data : data.results ?? [];

      maps[field.name] = {};

      records.forEach((record: any) => {
        maps[field.name][String(record.id)] = String(record[field.relation!.labelField]);
      });
    }

    setRelationMaps(maps);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');

      await fetchRelations();

      const data = await apiList(config.endpoint);
      setItems(Array.isArray(data) ? data : data.results ?? []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar registros.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [config.endpoint])
  );

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar exclusão', `Deseja excluir este ${config.singular.toLowerCase()}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(config.endpoint, id);
            setItems(prev => prev.filter(item => item.id !== id));
          } catch (err: any) {
            Alert.alert('Erro', err.message || 'Não foi possível excluir.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {formatValue(getDisplayValue(item, config.listFields[0]))}
      </Text>

      {config.listFields.slice(1).map(field => {
        const fieldConfig = config.fields.find(f => f.name === field);
        const label = fieldConfig?.label || field;

        return (
          <Text key={field} style={styles.cardText}>
            {label}: {formatValue(getDisplayValue(item, field))}
          </Text>
        );
      })}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EntityForm', { entityKey: config.key, item })}
        >
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{config.title}</Text>

      {loading && <ActivityIndicator size="large" color="#1E5AA8" />}
      {!!error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum registro encontrado para {config.title.toLowerCase()}.</Text>}
          contentContainerStyle={{ paddingBottom: 90 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EntityForm', { entityKey: config.key })}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#17233D', alignSelf: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#17233D', marginBottom: 6 },
  cardText: { fontSize: 14, color: '#5D6778', marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  editButton: { backgroundColor: '#1E5AA8' },
  deleteButton: { backgroundColor: '#D64545' },
  actionText: { color: '#fff', fontWeight: '700' },
  fab: { position: 'absolute', right: 22, bottom: 22, backgroundColor: '#1E5AA8', width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  empty: { textAlign: 'center', color: '#5D6778', marginTop: 40 },
  error: { backgroundColor: '#FDECEC', color: '#A12727', padding: 12, borderRadius: 10 },
});