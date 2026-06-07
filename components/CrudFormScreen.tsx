import { Picker } from '@react-native-picker/picker';
import { DrawerScreenProps } from '@react-navigation/drawer';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { entityConfigs, EntityField } from '../constants/entities';
import { DrawerParamList } from '../navigation/DrawerNavigator';
import { apiCreate, apiList, apiUpdate } from '../services/api';

type Props = DrawerScreenProps<DrawerParamList, 'EntityForm'>;

type Option = {
  id: number;
  label: string;
};

const toFormValue = (value: any) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value;
  if (typeof value === 'boolean') return value;
  return String(value);
};

const castValue = (field: EntityField, value: any) => {
  if (field.type === 'number' || field.type === 'select') {
    if (value === '') return null;
    const numeric = Number(value);
    return Number.isNaN(numeric) || field.choices ? value : numeric;
  }
  if (field.type === 'decimal') {
    if (value === '') return '0.00';
    return String(value).replace(',', '.');
  }
  if (field.type === 'boolean') return Boolean(value);
  if (field.type === 'multiselect') return Array.isArray(value) ? value : [];
  return value;
};

export default function CrudFormScreen({ route, navigation }: Props) {
  const { entityKey, item } = route.params;
  const config = entityConfigs[entityKey];
  const isEditing = Boolean(item?.id);

  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [relationOptions, setRelationOptions] = useState<Record<string, Option[]>>({});

  useEffect(() => {
    const initial: Record<string, any> = {};
    config.fields.forEach(field => {
      if (item && Object.prototype.hasOwnProperty.call(item, field.name)) {
        initial[field.name] = toFormValue(item[field.name]);
      } else if (field.type === 'boolean') {
        initial[field.name] = true;
      } else if (field.type === 'multiselect') {
        initial[field.name] = [];
      } else if (field.choices?.length) {
        initial[field.name] = field.choices[0].value;
      } else {
        initial[field.name] = '';
      }
    });
    setForm(initial);
  }, [entityKey, item?.id]);

  useEffect(() => {
    const loadRelations = async () => {
      const entries = await Promise.all(
        config.fields
          .filter(field => field.relation)
          .map(async field => {
            const data = await apiList(field.relation!.endpoint);
            const list = Array.isArray(data) ? data : data.results ?? [];
            const options = list.map((row: any) => ({
              id: row.id,
              label: row[field.relation!.labelField] || row.name || row.title || row.number || `ID ${row.id}`,
            }));
            return [field.name, options] as const;
          })
      );
      setRelationOptions(Object.fromEntries(entries));
    };
    loadRelations().catch(() => undefined);
  }, [entityKey]);

  const setValue = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleMulti = (name: string, id: number) => {
    const current = Array.isArray(form[name]) ? form[name] : [];
    const exists = current.includes(id);
    setValue(name, exists ? current.filter((value: number) => value !== id) : [...current, id]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: Record<string, any> = {};
      config.fields.forEach(field => {
        payload[field.name] = castValue(field, form[field.name]);
      });

      if (isEditing) {
        await apiUpdate(config.endpoint, item.id, payload);
      } else {
        await apiCreate(config.endpoint, payload);
      }

      navigation.navigate(entityKey as never);
    } catch (err: any) {
      Alert.alert('Erro ao salvar', err.message || 'Verifique os campos e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: EntityField) => {
    const value = form[field.name];

    if (field.type === 'boolean') {
      return (
        <View key={field.name} style={styles.switchRow}>
          <Text style={styles.label}>{field.label}</Text>
          <Switch value={Boolean(value)} onValueChange={(checked) => setValue(field.name, checked)} />
        </View>
      );
    }

    if (field.type === 'select') {
      const options = field.relation
        ? relationOptions[field.name]?.map(option => ({ label: option.label, value: option.id })) ?? []
        : field.choices ?? [];

      return (
        <View key={field.name}>
          <Text style={styles.label}>{field.label}</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={value} onValueChange={(selected) => setValue(field.name, selected)}>
              <Picker.Item label="Selecione..." value="" />
              {options.map(option => (
                <Picker.Item key={String(option.value)} label={String(option.label)} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>
      );
    }

    if (field.type === 'multiselect') {
      const options = relationOptions[field.name] ?? [];
      const selected = Array.isArray(value) ? value : [];
      return (
        <View key={field.name}>
          <Text style={styles.label}>{field.label}</Text>
          <View style={styles.multiContainer}>
            {options.map(option => {
              const active = selected.includes(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleMulti(field.name, option.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }

    return (
      <View key={field.name}>
        <Text style={styles.label}>{field.label}</Text>
        <TextInput
          value={String(value ?? '')}
          onChangeText={(text) => setValue(field.name, text)}
          style={[styles.input, field.type === 'textarea' && styles.textarea]}
          multiline={field.type === 'textarea'}
          keyboardType={field.type === 'number' || field.type === 'decimal' ? 'numeric' : 'default'}
          placeholder={field.type === 'date' ? '2026-06-01' : field.label}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEditing ? `Editar ${config.singular}` : `Novo ${config.singular}`}</Text>
      {config.fields.map(renderField)}

      {saving ? (
        <ActivityIndicator size="large" color="#1E5AA8" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>{isEditing ? 'Salvar alteracoes' : 'Cadastrar'}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate(entityKey as never)}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#17233D', marginBottom: 16, alignSelf: 'center' },
  label: { fontSize: 14, fontWeight: '700', color: '#34415A', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D8DEE9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  textarea: { height: 90, textAlignVertical: 'top' },
  pickerWrapper: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D8DEE9', borderRadius: 10, overflow: 'hidden' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  multiContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#1E5AA8', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#1E5AA8' },
  chipText: { color: '#1E5AA8', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  saveButton: { backgroundColor: '#1E5AA8', padding: 14, borderRadius: 10, marginTop: 24, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  backButton: { padding: 14, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  backText: { color: '#1E5AA8', fontSize: 15, fontWeight: '700' },
});
