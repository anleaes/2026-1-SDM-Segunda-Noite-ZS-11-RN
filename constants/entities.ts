export type FieldType = 'text' | 'textarea' | 'number' | 'decimal' | 'date' | 'boolean' | 'select' | 'multiselect';

export type Choice = {
  label: string;
  value: string | number | boolean;
};

export type RelationConfig = {
  endpoint: string;
  labelField: string;
};

export type EntityField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  choices?: Choice[];
  relation?: RelationConfig;
};

export type EntityConfig = {
  key: string;
  title: string;
  singular: string;
  endpoint: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  fields: EntityField[];
  listFields: string[];
};

const statusContrato = [
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Ativo', value: 'ATIVO' },
  { label: 'Vencido', value: 'VENCIDO' },
  { label: 'Encerrado', value: 'ENCERRADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
];

const statusPagamento = [
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Pago', value: 'PAGO' },
  { label: 'Atrasado', value: 'ATRASADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
];

const formasPagamento = [
  { label: 'Pix', value: 'PIX' },
  { label: 'Boleto', value: 'BOLETO' },
  { label: 'Cartão', value: 'CARTAO' },
  { label: 'Transferência', value: 'TRANSFERENCIA' },
  { label: 'Dinheiro', value: 'DINHEIRO' },
];

export const entityConfigs: Record<string, EntityConfig> = {
  clientes: {
    key: 'clientes',
    title: 'Clientes',
    singular: 'Cliente',
    endpoint: '/clientes/',
    icon: 'people-outline',
    listFields: ['company_name', 'cpf_cnpj', 'email'],
    fields: [
      { name: 'first_name', label: 'Primeiro nome', type: 'text', required: true },
      { name: 'last_name', label: 'Sobrenome', type: 'text', required: true },
      { name: 'address', label: 'Endereço', type: 'text', required: true },
      { name: 'phone', label: 'Telefone', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'text', required: true },
      { name: 'cpf_cnpj', label: 'CPF/CNPJ', type: 'text', required: true },
      { name: 'company_name', label: 'Razão social/Nome fantasia', type: 'text', required: true },
      { name: 'client_type', label: 'Tipo de cliente', type: 'select', choices: [
        { label: 'Pessoa Física', value: 'PF' },
        { label: 'Pessoa Jurídica', value: 'PJ' },
      ], required: true },
      { name: 'is_active', label: 'Ativo', type: 'boolean' },
      { name: 'contact_channels', label: 'Canais de contato', type: 'multiselect', relation: { endpoint: '/canais-contato/', labelField: 'name' } },
    ],
  },
  funcionarios: {
    key: 'funcionarios',
    title: 'Funcionários',
    singular: 'Funcionário',
    endpoint: '/funcionarios/',
    icon: 'briefcase-outline',
    listFields: ['first_name', 'last_name', 'position'],
    fields: [
      { name: 'first_name', label: 'Primeiro nome', type: 'text', required: true },
      { name: 'last_name', label: 'Sobrenome', type: 'text', required: true },
      { name: 'address', label: 'Endereço', type: 'text', required: true },
      { name: 'phone', label: 'Telefone', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'text', required: true },
      { name: 'registration', label: 'Matrícula', type: 'text', required: true },
      { name: 'position', label: 'Cargo', type: 'text', required: true },
      { name: 'department', label: 'Departamento', type: 'text', required: true },
      { name: 'salary', label: 'Salário', type: 'decimal', required: true },
    ],
  },
  usuarios: {
    key: 'usuarios',
    title: 'Usuários',
    singular: 'Usuário',
    endpoint: '/usuarios/',
    icon: 'person-circle-outline',
    listFields: ['username', 'profile', 'employee'],
    fields: [
      { name: 'username', label: 'Usuário', type: 'text', required: true },
      { name: 'password', label: 'Senha', type: 'text', required: true },
      { name: 'profile', label: 'Perfil', type: 'select', choices: [
        { label: 'Administrador', value: 'ADMIN' },
        { label: 'Gerente', value: 'GERENTE' },
        { label: 'Operador', value: 'OPERADOR' },
      ], required: true },
      { name: 'is_active', label: 'Ativo', type: 'boolean' },
      { name: 'employee', label: 'Funcionário', type: 'select', relation: { endpoint: '/funcionarios/', labelField: 'first_name' }, required: true },
    ],
  },
  canaisContato: {
    key: 'canaisContato',
    title: 'Canais de contato',
    singular: 'Canal de contato',
    endpoint: '/canais-contato/',
    icon: 'chatbubbles-outline',
    listFields: ['name', 'channel_type', 'is_active'],
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'channel_type', label: 'Tipo de canal', type: 'select', choices: [
        { label: 'Email', value: 'EMAIL' },
        { label: 'Telefone', value: 'TELEFONE' },
        { label: 'WhatsApp', value: 'WHATSAPP' },
        { label: 'Outro', value: 'OUTRO' },
      ], required: true },
      { name: 'is_active', label: 'Ativo', type: 'boolean' },
    ],
  },
  categoriasContrato: {
    key: 'categoriasContrato',
    title: 'Categorias de contrato',
    singular: 'Categoria de contrato',
    endpoint: '/categorias-contrato/',
    icon: 'pricetags-outline',
    listFields: ['name', 'priority_level', 'is_active'],
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'priority_level', label: 'Nível de prioridade', type: 'number', required: true },
      { name: 'is_active', label: 'Ativo', type: 'boolean' },
    ],
  },
  servicos: {
    key: 'servicos',
    title: 'Serviços',
    singular: 'Serviço',
    endpoint: '/servicos/',
    icon: 'construct-outline',
    listFields: ['name', 'unit_price', 'is_active'],
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'unit_price', label: 'Preço unitário', type: 'decimal', required: true },
      { name: 'is_active', label: 'Ativo', type: 'boolean' },
    ],
  },
  contratos: {
    key: 'contratos',
    title: 'Contratos',
    singular: 'Contrato',
    endpoint: '/contratos/',
    icon: 'document-text-outline',
    listFields: ['number', 'title', 'status', 'total_value'],
    fields: [
      { name: 'number', label: 'Número', type: 'text', required: true },
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'start_date', label: 'Data de início (AAAA-MM-DD)', type: 'date', required: true },
      { name: 'end_date', label: 'Data de fim (AAAA-MM-DD)', type: 'date', required: true },
      { name: 'total_value', label: 'Valor total', type: 'decimal', required: true },
      { name: 'status', label: 'Status', type: 'select', choices: statusContrato, required: true },
      { name: 'client', label: 'Cliente', type: 'select', relation: { endpoint: '/clientes/', labelField: 'company_name' }, required: true },
      { name: 'employee', label: 'Funcionário responsável', type: 'select', relation: { endpoint: '/funcionarios/', labelField: 'first_name' }, required: true },
      { name: 'category', label: 'Categoria', type: 'select', relation: { endpoint: '/categorias-contrato/', labelField: 'name' }, required: true },
    ],
  },
  itensContrato: {
    key: 'itensContrato',
    title: 'Itens de contrato',
    singular: 'Item de contrato',
    endpoint: '/itens-contrato/',
    icon: 'cart-outline',
    listFields: ['contract', 'service', 'quantity', 'total_price'],
    fields: [
      { name: 'quantity', label: 'Quantidade', type: 'number', required: true },
      { name: 'unitary_price', label: 'Preço unitário', type: 'decimal', required: true },
      { name: 'total_price', label: 'Preço total', type: 'decimal', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'service', label: 'Serviço', type: 'select', relation: { endpoint: '/servicos/', labelField: 'name' }, required: true },
      { name: 'contract', label: 'Contrato', type: 'select', relation: { endpoint: '/contratos/', labelField: 'number' }, required: true },
    ],
  },
  pagamentos: {
    key: 'pagamentos',
    title: 'Pagamentos',
    singular: 'Pagamento',
    endpoint: '/pagamentos/',
    icon: 'cash-outline',
    listFields: ['contract', 'installment_number', 'value', 'status'],
    fields: [
      { name: 'installment_number', label: 'Número da parcela', type: 'number', required: true },
      { name: 'due_date', label: 'Data de vencimento (AAAA-MM-DD)', type: 'date', required: true },
      { name: 'payment_date', label: 'Data de pagamento (AAAA-MM-DD)', type: 'date' },
      { name: 'value', label: 'Valor', type: 'decimal', required: true },
      { name: 'status', label: 'Status', type: 'select', choices: statusPagamento, required: true },
      { name: 'payment_method', label: 'Forma de pagamento', type: 'select', choices: formasPagamento, required: true },
      { name: 'contract', label: 'Contrato', type: 'select', relation: { endpoint: '/contratos/', labelField: 'number' }, required: true },
    ],
  },
  documentos: {
    key: 'documentos',
    title: 'Documentos',
    singular: 'Documento',
    endpoint: '/documentos/',
    icon: 'folder-outline',
    listFields: ['file_name', 'file_type', 'is_signed'],
    fields: [
      { name: 'file_name', label: 'Nome do arquivo', type: 'text', required: true },
      { name: 'file_type', label: 'Tipo do arquivo', type: 'text', required: true },
      { name: 'file_path', label: 'Caminho do arquivo', type: 'text', required: true },
      { name: 'upload_date', label: 'Data de upload (AAAA-MM-DD)', type: 'date', required: true },
      { name: 'is_signed', label: 'Assinado', type: 'boolean' },
      { name: 'contract', label: 'Contrato', type: 'select', relation: { endpoint: '/contratos/', labelField: 'number' }, required: true },
    ],
  },
  notificacoes: {
    key: 'notificacoes',
    title: 'Notificações',
    singular: 'Notificação',
    endpoint: '/notificacoes/',
    icon: 'notifications-outline',
    listFields: ['title', 'notification_type', 'is_read'],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'message', label: 'Mensagem', type: 'textarea', required: true },
      { name: 'notification_date', label: 'Data da notificação (AAAA-MM-DD)', type: 'date', required: true },
      { name: 'notification_type', label: 'Tipo', type: 'select', choices: [
        { label: 'Vencimento', value: 'VENCIMENTO' },
        { label: 'Pagamento', value: 'PAGAMENTO' },
        { label: 'Documento', value: 'DOCUMENTO' },
        { label: 'Geral', value: 'GERAL' },
      ], required: true },
      { name: 'is_read', label: 'Lida', type: 'boolean' },
      { name: 'contract', label: 'Contrato', type: 'select', relation: { endpoint: '/contratos/', labelField: 'number' }, required: true },
    ],
  },
  auditorias: {
    key: 'auditorias',
    title: 'Auditorias',
    singular: 'Auditoria',
    endpoint: '/auditorias/',
    icon: 'time-outline',
    listFields: ['action', 'action_date', 'ip_address'],
    fields: [
      { name: 'action', label: 'Ação', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
      { name: 'action_date', label: 'Data da ação (AAAA-MM-DD)', type: 'date', required: true },
      { name: 'ip_address', label: 'Endereço IP', type: 'text', required: true },
      { name: 'user', label: 'Usuário', type: 'select', relation: { endpoint: '/usuarios/', labelField: 'username' }, required: true },
      { name: 'contract', label: 'Contrato', type: 'select', relation: { endpoint: '/contratos/', labelField: 'number' }, required: true },
    ],
  },
};

export const drawerEntityKeys = [
  'clientes',
  'funcionarios',
  'usuarios',
  'canaisContato',
  'categoriasContrato',
  'servicos',
  'contratos',
  'itensContrato',
  'pagamentos',
  'documentos',
  'notificacoes',
  'auditorias',
];
