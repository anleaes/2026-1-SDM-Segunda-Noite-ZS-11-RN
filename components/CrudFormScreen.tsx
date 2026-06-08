import { Picker } from '@react-native-picker/picker';
import { DrawerScreenProps } from '@react-navigation/drawer';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

const onlyDigits = (value: any) => String(value ?? '').replace(/\D/g, '');

const maskPhone = (value: any) => {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const maskCpfCnpj = (value: any, clientType?: string) => {
  const maxLength = clientType === 'PF' ? 11 : 14;
  const digits = onlyDigits(value).slice(0, maxLength);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  if (digits.length <= 11) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const maskFieldValue = (fieldName: string, value: any, formValues?: Record<string, any>) => {
  if (fieldName === 'phone') return maskPhone(value);
  if (fieldName === 'cpf_cnpj') return maskCpfCnpj(value, formValues?.client_type);
  return value;
};

const normalizeDateValue = (value: any) => {
  const text = String(value ?? '').trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const brMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (isoMatch) return text;
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month}-${day}`;
  }

  return text;
};

const parseDateInput = (value: any) => {
  const text = String(value ?? '').trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const brMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  const parts = isoMatch
    ? { year: Number(isoMatch[1]), month: Number(isoMatch[2]), day: Number(isoMatch[3]) }
    : brMatch
      ? { year: Number(brMatch[3]), month: Number(brMatch[2]), day: Number(brMatch[1]) }
      : null;

  if (!parts) return null;

  const date = new Date(parts.year, parts.month - 1, parts.day);
  const isValid =
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.month - 1 &&
    date.getDate() === parts.day;

  return isValid ? date : null;
};

const todayDateOnly = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
  if (field.type === 'date') return normalizeDateValue(value);
  if (field.type === 'boolean') return Boolean(value);
  if (field.type === 'multiselect') return Array.isArray(value) ? value : [];
  return value;
};

export default function CrudFormScreen({ route, navigation }: Props) {
  const { entityKey, item } = route.params;
  const config = entityConfigs[entityKey];
  const isEditing = Boolean(item?.id);
  const isReadOnly = config.key === 'auditorias';

  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [relationOptions, setRelationOptions] = useState<Record<string, Option[]>>({});

  useEffect(() => {
    navigation.setOptions({
      title: isReadOnly ? `Visualizar ${config.singular}` : isEditing ? `Editar ${config.singular}` : `Novo ${config.singular}`,
    });
  }, [config.singular, isEditing, isReadOnly, navigation]);

  useEffect(() => {
    const initial: Record<string, any> = {};
    config.fields.forEach(field => {
      if (item && Object.prototype.hasOwnProperty.call(item, field.name)) {
        initial[field.name] = maskFieldValue(field.name, toFormValue(item[field.name]), initial);
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
    if (formError) setFormError('');

    setForm(prev => {
      const next = { ...prev, [name]: value };

      if (name === 'client_type') {
        next.cpf_cnpj = maskFieldValue('cpf_cnpj', next.cpf_cnpj, next);
      }

      next[name] = maskFieldValue(name, value, next);
      return next;
    });
  };

  const toggleMulti = (name: string, id: number) => {
    const current = Array.isArray(form[name]) ? form[name] : [];
    const exists = current.includes(id);
    setValue(name, exists ? current.filter((value: number) => value !== id) : [...current, id]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFormError('');

      if (config.key === 'clientes') {
        const documentDigits = onlyDigits(form.cpf_cnpj);

        if (form.client_type === 'PF' && documentDigits.length !== 11) {
          setFormError('CPF invalido. Para pessoa fisica, informe um CPF com 11 digitos.');
          return;
        }

        if (form.client_type === 'PJ' && documentDigits.length !== 14) {
          setFormError('CNPJ invalido. Para pessoa juridica, informe um CNPJ com 14 digitos.');
          return;
        }
      }

      if (config.key === 'contratos') {
        const startDate = parseDateInput(form.start_date);
        const endDate = parseDateInput(form.end_date);

        if (!startDate) {
          setFormError('Data de inicio invalida. Informe a data de inicio em yyyy-mm-dd ou dd/mm/yyyy.');
          return;
        }

        if (!endDate) {
          setFormError('Data de termino invalida. Informe a data de termino em yyyy-mm-dd ou dd/mm/yyyy.');
          return;
        }

        if (startDate < todayDateOnly()) {
          setFormError('Data de inicio invalida. A data de inicio do contrato nao pode ser anterior a hoje.');
          return;
        }

        if (endDate < startDate) {
          setFormError('Data de termino invalida. A data de termino nao pode ser menor que a data de inicio.');
          return;
        }
      }

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
      setFormError(err.message || 'Erro ao salvar. Verifique os campos e tente novamente.');
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
          <Switch
            value={Boolean(value)}
            disabled={isReadOnly}
            onValueChange={(checked) => setValue(field.name, checked)}
          />
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
            <Picker
              selectedValue={value}
              enabled={!isReadOnly}
              onValueChange={(selected) => setValue(field.name, selected)}
              style={styles.picker}
            >
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
                  disabled={isReadOnly}
                  style={[styles.chip, active && styles.chipActive, isReadOnly && styles.disabledControl]}
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
          editable={!isReadOnly}
          onChangeText={(text) => setValue(field.name, text)}
          style={[styles.input, field.type === 'textarea' && styles.textarea, isReadOnly && styles.readOnlyInput]}
          multiline={field.type === 'textarea'}
          keyboardType={field.type === 'number' || field.type === 'decimal' || field.name === 'phone' || field.name === 'cpf_cnpj' ? 'numeric' : 'default'}
          placeholder={field.name === 'phone' ? '(11) 99999-9999' : field.name === 'cpf_cnpj' ? '000.000.000-00' : field.type === 'date' ? '' : field.label}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isReadOnly ? `Visualizar ${config.singular}` : isEditing ? `Editar ${config.singular}` : `Novo ${config.singular}`}
      </Text>
      {config.fields.map(renderField)}

      {formError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      ) : null}

      {!isReadOnly && (
        saving ? (
          <ActivityIndicator size="large" color="#1E5AA8" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>{isEditing ? 'Salvar alteracoes' : 'Cadastrar'}</Text>
          </TouchableOpacity>
        )
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
  readOnlyInput: { backgroundColor: '#EEF2F7', color: '#5D6778' },
  textarea: { height: 90, textAlignVertical: 'top' },
  pickerWrapper: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D8DEE9', borderRadius: 10, minHeight: 48, justifyContent: 'center', overflow: 'hidden' },
  picker: { minHeight: 48, fontSize: 15, color: '#17233D' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  multiContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#1E5AA8', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#1E5AA8' },
  chipText: { color: '#1E5AA8', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  disabledControl: { opacity: 0.65 },
  errorBox: { backgroundColor: '#FDECEC', borderWidth: 1, borderColor: '#E08A8A', borderRadius: 10, padding: 12, marginTop: 18 },
  errorText: { color: '#8A1F1F', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  saveButton: { backgroundColor: '#1E5AA8', padding: 14, borderRadius: 10, marginTop: 24, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  backButton: { padding: 14, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  backText: { color: '#1E5AA8', fontSize: 15, fontWeight: '700' },
});
