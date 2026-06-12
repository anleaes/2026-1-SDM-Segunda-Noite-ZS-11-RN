import { Ionicons } from '@expo/vector-icons';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { entityConfigs } from '../constants/entities';
import { DrawerParamList } from '../navigation/DrawerNavigator';
import { apiList } from '../services/api';
import { canManageEntity } from '../constants/access';
import { useAuth } from '../contexts/AuthContext';

type Props = DrawerScreenProps<DrawerParamList, 'Home'>;
type RouteName = keyof DrawerParamList;

type DashboardData = {
  contratos: any[];
  clientes: any[];
  pagamentos: any[];
  documentos: any[];
};

const initialData: DashboardData = {
  contratos: [],
  clientes: [],
  pagamentos: [],
  documentos: [],
};

const quickActions: Array<{
  label: string;
  route: RouteName;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { label: 'Novo contrato', route: 'EntityForm', icon: 'add-outline' },
  { label: 'Contratos', route: 'contratos', icon: 'folder-open-outline' },
  { label: 'Pagamentos', route: 'pagamentos', icon: 'cash-outline' },
  { label: 'Documentos', route: 'documentos', icon: 'document-attach-outline' },
];

const getRecords = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number) => currency.format(value);

const isWithinNextDays = (dateValue: string | undefined, days: number) => {
  if (!dateValue) return false;

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limit = new Date(today);
  limit.setDate(today.getDate() + days);

  return date >= today && date <= limit;
};

const HomeScreen = ({ navigation }: Props) => {
  const { profile } = useAuth();
  const canManageContracts = canManageEntity(profile, 'contratos');
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const openEntityForm = () => {
    navigation.navigate('EntityForm', { entityKey: 'contratos' });
  };

  const handleQuickAction = (route: RouteName) => {
    if (route === 'EntityForm') {
      openEntityForm();
      return;
    }

    navigation.navigate(route as any);
  };

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [contratos, clientes, pagamentos, documentos] = await Promise.all([
        apiList(entityConfigs.contratos.endpoint),
        apiList(entityConfigs.clientes.endpoint),
        apiList(entityConfigs.pagamentos.endpoint),
        apiList(entityConfigs.documentos.endpoint),
      ]);

      setData({
        contratos: getRecords(contratos),
        clientes: getRecords(clientes),
        pagamentos: getRecords(pagamentos),
        documentos: getRecords(documentos),
      });
    } catch (err: any) {
      setError(err.message || 'Nao foi possivel carregar o painel.');
      setData(initialData);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const summary = useMemo(() => {
    const activeContracts = data.contratos.filter((item) => item.status === 'ATIVO').length;
    const totalValue = data.contratos.reduce((sum, item) => {
      const value = Number(item.total_value);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    const averageTicket = data.contratos.length > 0 ? totalValue / data.contratos.length : 0;
    const upcomingContracts = data.contratos.filter((item) => isWithinNextDays(item.end_date, 30)).length;
    const pendingPayments = data.pagamentos.filter((item) => ['PENDENTE', 'ATRASADO'].includes(item.status)).length;
    const unsignedDocuments = data.documentos.filter((item) => item.is_signed === false).length;

    return {
      activeContracts,
      totalContracts: data.contratos.length,
      clients: data.clientes.length,
      totalValue,
      averageTicket,
      upcomingContracts,
      pendingPayments,
      unsignedDocuments,
    };
  }, [data]);

  const metrics = [
    {
      label: 'Contratos ativos',
      value: String(summary.activeContracts),
      detail: `${summary.totalContracts} no total`,
      icon: 'document-text-outline',
      tone: '#1E5AA8',
      background: '#EAF2FF',
    },
    {
      label: 'Clientes',
      value: String(summary.clients),
      detail: 'cadastrados',
      icon: 'people-outline',
      tone: '#0F8A5F',
      background: '#E9F8F1',
    },
    {
      label: 'Vencimentos',
      value: String(summary.upcomingContracts),
      detail: 'proximos 30 dias',
      icon: 'calendar-outline',
      tone: '#B56A12',
      background: '#FFF3DF',
    },
    {
      label: 'Pendencias',
      value: String(summary.pendingPayments + summary.unsignedDocuments),
      detail: 'pagamentos e docs',
      icon: 'alert-circle-outline',
      tone: '#B42318',
      background: '#FDECEC',
    },
  ];

  const priorities = [
    {
      title: 'Renovar contratos vencendo',
      meta: `${summary.upcomingContracts} nos proximos 30 dias`,
      icon: 'time-outline',
      route: 'contratos',
    },
    {
      title: 'Conferir pagamentos pendentes',
      meta: `${summary.pendingPayments} pagamentos em aberto`,
      icon: 'card-outline',
      route: 'pagamentos',
    },
    {
      title: 'Validar documentos assinados',
      meta: `${summary.unsignedDocuments} documentos sem assinatura`,
      icon: 'shield-checkmark-outline',
      route: 'documentos',
    },
  ];

  return (
    <ScrollView
      testID="home-dashboard-scroll"
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>Painel executivo</Text>
          <Text style={styles.title}>Gestao de contratos</Text>
        </View>
        {canManageContracts && (
          <TouchableOpacity style={styles.iconButton} onPress={openEntityForm}>
            <Ionicons name="add-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {!!error && (
        <TouchableOpacity style={styles.errorBox} onPress={loadDashboard}>
          <Ionicons name="refresh-outline" size={20} color="#A12727" />
          <Text style={styles.errorText}>{error}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.summaryPanel}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryLabel}>Carteira contratual</Text>
            <Text style={styles.summaryValue}>
              {loading ? '...' : formatCurrency(summary.totalValue)}
            </Text>
          </View>
          <View style={styles.statusPill}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Atualizado</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.summaryFooter}>
          <View>
            <Text style={styles.footerLabel}>Ticket medio</Text>
            <Text style={styles.footerValue}>
              {loading ? '...' : formatCurrency(summary.averageTicket)}
            </Text>
          </View>
          <View style={styles.footerDivider} />
          <View>
            <Text style={styles.footerLabel}>Contratos</Text>
            <Text style={styles.footerValue}>{loading ? '...' : summary.totalContracts}</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((item) => (
          <View key={item.label} style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: item.background }]}>
              <Ionicons name={item.icon as any} size={20} color={item.tone} />
            </View>
            <Text style={styles.metricValue}>{loading ? '...' : item.value}</Text>
            <Text style={styles.metricLabel}>{item.label}</Text>
            <Text style={[styles.metricDetail, { color: item.tone }]}>
              {loading ? 'carregando' : item.detail}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Acoes rapidas</Text>
      </View>

      <View style={styles.actionsGrid}>
        {quickActions.filter(item => item.route !== 'EntityForm' || canManageContracts).map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.actionButton}
            onPress={() => handleQuickAction(item.route)}
          >
            <Ionicons name={item.icon} size={22} color="#1E5AA8" />
            <Text style={styles.actionText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Prioridades</Text>
        <TouchableOpacity onPress={() => navigation.navigate('notificacoes')}>
          <Text style={styles.sectionLink}>Ver alertas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.priorityList}>
        {priorities.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.priorityItem}
            onPress={() => navigation.navigate(item.route as any)}
          >
            <View style={styles.priorityIcon}>
              <Ionicons name={item.icon as any} size={21} color="#17233D" />
            </View>
            <View style={styles.priorityContent}>
              <Text style={styles.priorityTitle}>{item.title}</Text>
              <Text style={styles.priorityMeta}>{loading ? 'carregando dados' : item.meta}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#8A94A6" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrow: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#17233D',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#1E5AA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: '#FDECEC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#A12727',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryPanel: {
    backgroundColor: '#17233D',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    color: '#B8C3D7',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '900',
    marginTop: 6,
  },
  statusPill: {
    minHeight: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#37D67A',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  summaryFooter: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  footerLabel: {
    color: '#B8C3D7',
    fontSize: 12,
    fontWeight: '700',
  },
  footerValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  footerDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    width: '48.5%',
    minHeight: 142,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7ECF3',
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    color: '#17233D',
    fontSize: 24,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#475467',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  metricDetail: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#17233D',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionLink: {
    color: '#1E5AA8',
    fontSize: 13,
    fontWeight: '800',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    width: '48.5%',
    minHeight: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7ECF3',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  actionText: {
    flex: 1,
    color: '#17233D',
    fontSize: 14,
    fontWeight: '800',
  },
  priorityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7ECF3',
    overflow: 'hidden',
  },
  priorityItem: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  priorityIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityContent: {
    flex: 1,
  },
  priorityTitle: {
    color: '#17233D',
    fontSize: 15,
    fontWeight: '800',
  },
  priorityMeta: {
    color: '#667085',
    fontSize: 13,
    marginTop: 3,
  },
});

export default HomeScreen;
