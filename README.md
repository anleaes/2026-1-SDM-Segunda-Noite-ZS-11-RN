# Gestão de Contratos - React Native

Front-end em React Native/Expo adaptado para o projeto de Gestão de Contratos da A3.

## Rodar o projeto

```bash
npm install
npm start
```

## Configurar backend

O endereço da API fica em:

```ts
constants/api.ts
```

Por padrão está assim:

```ts
export const API_BASE_URL = 'http://127.0.0.1:8000';
```

Use:

- Web/Windows local: `http://127.0.0.1:8000`
- Android Emulator: `http://10.0.2.2:8000`
- Celular físico no Expo Go: `http://IP_DO_SEU_PC:8000`

## Telas implementadas

- Clientes
- Funcionários
- Usuários
- Canais de contato
- Categorias de contrato
- Serviços
- Contratos
- Itens de contrato
- Pagamentos
- Documentos
- Notificações
- Auditorias

O conceito de carrinho de compras foi adaptado como:

- `Contract` = contrato
- `Service` = serviço
- `ContractItem` = item do contrato
