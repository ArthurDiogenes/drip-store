# 🏪 DripStore - E-commerce Moderno

> Uma loja virtual completa de tênis e produtos esportivos desenvolvida com React e Tailwind CSS

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## 📋 Sobre o Projeto

A **DripStore** é uma aplicação de e-commerce completa desenvolvida para o Geração Tech 2.0. O projeto simula uma loja virtual real com funcionalidades avançadas de autenticação, carrinho de compras, sistema de pagamento e gestão de pedidos.

### ✨ Características Principais

- **Interface Moderna**: Design responsivo e intuitivo
- **Autenticação Completa**: Sistema de login, cadastro e gestão de perfil
- **Carrinho Inteligente**: Persistência de dados e cálculos automáticos
- **Sistema de Checkout**: Múltiplos métodos de pagamento e cálculo de frete
- **Gestão de Pedidos**: Acompanhamento completo do status dos pedidos
- **Busca Avançada**: Sistema de pesquisa com sugestões e filtros
- **Cupons de Desconto**: Sistema promocional integrado

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.1.0** - Biblioteca principal para construção da interface
- **Tailwind CSS 3.4.1** - Framework CSS utilitário para estilização
- **Vite 6.3.5** - Build tool e servidor de desenvolvimento
- **React Router Dom 7.6.0** - Roteamento do lado do cliente
- **Swiper 11.2.6** - Carrosséis e galerias interativas

### Backend & Infraestrutura
- **Supabase** - Backend as a Service (autenticação, banco de dados, storage)
- **PostgreSQL** - Banco de dados relacional via Supabase
- **Lucide React** - Ícones modernos e customizáveis

### Ferramentas de Desenvolvimento
- **ESLint** - Análise estática de código
- **PostCSS** - Processamento de CSS
- **React Toastify** - Notificações elegantes
- **UUID** - Geração de identificadores únicos

## 🚀 Funcionalidades

### 🏠 Páginas Principais
- **Home**: Banner dinâmico, produtos em destaque, categorias
- **Catálogo**: Listagem com filtros avançados e busca
- **Produto**: Galeria de imagens, variações, avaliações
- **Carrinho**: Gestão de itens, cupons, cálculo de frete
- **Checkout**: Finalização segura com múltiplas opções de pagamento

### 👤 Área do Cliente
- **Perfil**: Edição de dados pessoais e endereços
- **Pedidos**: Histórico completo com status em tempo real
- **Métodos de Pagamento**: Gerenciamento de cartões salvos
- **Autenticação**: Login/cadastro com validação completa

### 🛍️ Sistema de Compras
- **Carrinho Persistente**: Mantém itens entre sessões
- **Cálculo de Frete**: Baseado em CEP com múltiplas opções
- **Cupons de Desconto**: Sistema promocional avançado
- **Checkout Seguro**: Validação completa e confirmação

### 🔍 Recursos Avançados
- **Busca Inteligente**: Sugestões em tempo real
- **Filtros Dinâmicos**: Por marca, categoria, preço, etc.
- **Sistema de Avaliações**: Ratings e comentários
- **Produtos Relacionados**: Recomendações automáticas



## 🎨 Componentes Principais

### ProductCard
Exibe informações do produto com imagem, preço e promoções.

### CartItem
Gerencia itens individuais no carrinho com controles de quantidade.

### UserInfoSection
Interface para exibição e edição de dados do usuário.

### StatusBadge
Indicadores visuais de status para pedidos.

### Toast System
Sistema de notificações não-invasivas.

## 🔐 Autenticação e Segurança

- **Autenticação via Supabase**: Login seguro com JWT
- **Proteção de Rotas**: Middleware para páginas privadas
- **Validação de Dados**: Validação client-side e server-side
- **Sanitização**: Limpeza de dados de entrada
- **Criptografia**: Senhas hasheadas automaticamente

## 🛒 Sistema de E-commerce

### Gestão de Produtos
- Categorização automática
- Variações de cor e tamanho
- Sistema de desconto e promoções
- Galeria de imagens responsiva

### Carrinho de Compras
- Persistência entre sessões
- Cálculos automáticos de subtotal
- Aplicação de cupons de desconto
- Validação de estoque

### Sistema de Checkout
- Múltiplos métodos de pagamento
- Cálculo automático de frete
- Validação de dados de entrega
- Confirmação de pedido

## 📱 Responsividade

A aplicação é totalmente responsiva, funcionando perfeitamente em:
- 📱 Dispositivos móveis (320px+)
- 📟 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Telas grandes (1440px+)

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Pré-visualização
```bash
npm run preview
```

### Deploy Automático
O projeto está configurado para deploy automático no Vercel

## 🧪 Dados de Teste

### Usuário de Demonstração
```
Email: demo@dripstore.com
Senha: demo123456
```

### Cartões de Teste
```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
Validade: 12/28
CVV: 123
```

### CEPs para Teste de Frete
```
60000-000 (Fortaleza/CE) - Frete Reduzido
01000-000 (São Paulo/SP) - Frete Padrão
20000-000 (Rio de Janeiro/RJ) - Frete Padrão
```

## 🤝 Como Contribuir

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. Abra um **Pull Request**

### Padrões de Commit
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: mudanças de formatação
refactor: refatoração de código
test: adiciona testes
```

## 📚 Recursos de Aprendizado

- [Documentação do React](https://react.dev/)
- [Guia do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [React Router](https://reactrouter.com/en/main)
- [Guia do Vite](https://vitejs.dev/guide/)

## 🎯 Próximas Funcionalidades

- [ ] Sistema de wishlist
- [ ] Chat de atendimento
- [ ] Programa de fidelidade
- [ ] Avaliações e comentários
- [ ] Sistema de notificações push
- [ ] Dashboard administrativo
- [ ] Integração com redes sociais
- [ ] Sistema de afiliados

## 🐛 Problemas Conhecidos

### Limitações Atuais
- Pagamentos são simulados (não processa transações reais)
- Cálculo de frete baseado em simulação
- Sistema de estoque simplificado

### Como Reportar Bugs
1. Verifique se o bug já foi reportado nas [Issues](https://github.com/ArthurDiogenes/drip-store/issues)
2. Abra uma nova issue com:
   - Descrição detalhada do problema
   - Passos para reproduzir
   - Screenshots (se aplicável)
   - Informações do ambiente (navegador, SO)

## 📄 Licença

Este projeto é licenciado sob a [MIT License](LICENSE).

## 👨‍💻 Desenvolvedores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ArthurDiogenes">
        <img src="https://github.com/ArthurDiogenes.png" width="100px;" alt="Arthur Diógenes"/>
        <br />
        <sub><b>Arthur Diógenes</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/FilippeMonteiro">
        <img src="https://github.com/FilippeMonteiro.png" width="100px;" alt="Filippe Monteiro"/>
        <br />
        <sub><b>Filippe Monteiro</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/LucasCarvalhoo">
        <img src="https://github.com/LucasCarvalhoo.png" width="100px;" alt="Lucas Carvalho"/>
        <br />
        <sub><b>Lucas Carvalho</b></sub>
      </a>
    </td>
  </tr>
</table>

## 💖 Agradecimentos

- **UIEL, FIEC, ADECE, Gov. do Ceará e Digital College** - Pelo oportunidade de participar do **Geração Tech 2.0**
- **Luan Oliveira dos Santos** - Pela atenciosa orientação
- **Comunidade React** - Pela documentação e suporte
- **Equipe Supabase** - Pela plataforma incrível
  
---

<div align="center">
  <p>Desenvolvido com ❤️ e muito ☕ pela equipe DripStore</p>
  <p>
    <a href="https://github.com/ArthurDiogenes/drip-store">⭐ Star no GitHub</a> •
    <a href="https://github.com/ArthurDiogenes/drip-store/issues">🐛 Reportar Bug</a> •
    <a href="https://github.com/ArthurDiogenes/drip-store/discussions">💬 Discussões</a>
  </p>
</div>
