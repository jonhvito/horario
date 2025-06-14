# UFPB Schedule System

Um aplicativo React para montar e exportar horários de disciplinas da UFPB. Este projeto permite que os usuários adicionem, editem e removam disciplinas, visualizem conflitos de horário e exportem a grade de horários em diferentes formatos.

## Demonstração

[Adicione aqui um screenshot ou gif do projeto em funcionamento]

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (versão 6 ou superior)

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/ufpb-schedule-system.git
   cd ufpbschedule-system
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`.

## Build de Produção

Para gerar a build de produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist`.

## Testes

Para executar os testes:

```bash
npm test
```

Os testes são executados em ambiente Node, com mocks para APIs do navegador (localStorage, document, window).

## Estrutura do Projeto

- `src/`: Código fonte do projeto
  - `components/`: Componentes React reutilizáveis
  - `contexts/`: Contextos React (tema, notificações)
  - `hooks/`: Hooks personalizados
  - `layouts/`: Layouts da aplicação
  - `services/`: Serviços (SubjectService, StorageService)
  - `stores/`: Stores Zustand
  - `types/`: Definições de tipos TypeScript
  - `utils/`: Funções utilitárias
  - `__tests__/`: Testes unitários

## Tecnologias Utilizadas

- React
- TypeScript
- Zustand (gerenciamento de estado)
- Tailwind CSS (estilização)
- Jest (testes)

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.