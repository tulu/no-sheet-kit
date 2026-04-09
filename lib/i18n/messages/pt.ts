export const ptMessages = {
  common: {
    localeLabel: "Idioma",
    localeShort: {
      en: "EN",
      es: "ES",
      pt: "PT",
    },
    backToNoSheetKit: "← Voltar para NoSheetKit",
    home: "Home",
    getStarted: "Começar",
    privacy: "Privacidade",
    terms: "Termos",
    github: "GitHub",
    or: "ou",
  },
  landing: {
    nav: {
      getStarted: "Começar",
    },
    hero: {
      titleStart: "Sua vida,",
      titleEmphasis: "não",
      titleEnd: "uma planilha.",
      description:
        "NoSheetKit é um kit pessoal para o que você realmente precisa acompanhar, sem planilhas, contas, bancos de dados ou mensalidades.",
      exploreApps: "Explorar apps",
      viewGithub: "Ver no GitHub",
    },
    why: {
      titleStart: "Feito para o que",
      titleEmphasis: "escapa",
      titleEnd: "no dia a dia.",
      items: [
        {
          title: "Só seu",
          body: "Os dados ficam no localStorage do seu navegador e, opcionalmente, sincronizam com seu Google Drive. Nenhum servidor toca suas informações.",
        },
        {
          title: "Sem backend, sem custos",
          body: "100% client-side. Sem assinatura, sem contas para gerenciar e sem lock-in. Você publica em minutos.",
        },
        {
          title: "Lembretes que funcionam",
          body: "Em vez de push notifications que exigem servidor, o NoSheetKit cria eventos no seu Google Calendar com lembretes por e-mail.",
        },
        {
          title: "Modular por design",
          body: "Cada app é independente. Use um ou todos. O design system compartilhado mantém tudo consistente.",
        },
      ],
    },
    apps: {
      titleStart: "Ferramentas pequenas,",
      titleEmphasis: "um",
      titleEnd: "kit coerente.",
      cards: {
        loans: {
          desc: "Acompanhe dinheiro emprestado e dinheiro que você tomou emprestado. Saiba quem deve o quê, quando vence e mantenha um histórico limpo.",
          features: [
            "Registrar empréstimos dados e recebidos",
            "Acompanhar pagamentos parciais",
            "Lembretes de vencimento via Google Calendar",
            "Histórico completo de quitação",
          ],
        },
        dates: {
          desc: "Nunca mais esqueça aniversários e datas especiais. Guarde datas importantes e receba lembretes no Google Calendar.",
          features: [
            "Aniversários, comemorações e mais",
            "Lembretes anuais recorrentes",
            "Alertas por e-mail via Google Calendar",
            "Contagem regressiva de dias",
          ],
        },
        links: {
          desc: "Salve e organize seus links importantes em um só lugar para encontrar tudo rapidamente.",
          features: [
            "Salvar links úteis com título",
            "Agrupar links por tema",
            "Busca e filtros rápidos",
            "Manter recursos organizados",
          ],
        },
        domains: {
          desc: "Gerencie todos os seus domínios em um só lugar. Acompanhe registradores, renovações, notas de DNS e evite expiração.",
          features: [
            "Registro de domínio + registrador",
            "Acompanhamento de renovação",
            "Alertas de expiração via Google Calendar",
            "Notas de DNS e hospedagem",
          ],
        },
      },
      cta: "Começar",
    },
    how: {
      titleStart: "Simples por design,",
      titleEmphasis: "privado",
      titleEnd: "por padrão.",
      steps: [
        {
          n: "1",
          title: "Use imediatamente — sem login",
          body: "Abra o app e comece a adicionar dados na hora. Tudo fica no localStorage do navegador. Sem conta e sem configuração.",
        },
        {
          n: "2",
          title: "Faça login com Google (opcional)",
          body: "Se quiser backups ou lembretes, entre com Google. Isso habilita Drive e Calendar, mas nunca é obrigatório.",
        },
        {
          n: "3",
          title: "Faça backup no seu próprio Google Drive",
          body: "Com login, seus dados podem ser salvos em JSON no seu Drive. Os arquivos são seus: o NoSheetKit não guarda nada em servidor.",
        },
        {
          n: "4",
          title: "Receba lembretes no Google Calendar",
          body: "Vencimentos e eventos importantes criam entradas em um calendário dedicado do NoSheetKit. Requer login Google.",
        },
      ],
    },
    cta: {
      titleStart: "Comece a acompanhar o que",
      titleEmphasis: "realmente",
      titleEnd: "importa.",
      description: "Seus dados, seu dispositivo. Sem conta obrigatória.",
      button: "Começar",
    },
    footer: {
      copyright: "© 2026 NoSheetKit",
    },
  },
  login: {
    title: "Bem-vindo",
    description:
      "Entre para sincronizar seus dados entre dispositivos com Google Drive, ou continue em modo privado com armazenamento local.",
    continueWithGoogle: "Continuar com Google",
    continueAnonymously: "Continuar sem login",
    legalPrefix: "Ao continuar você aceita nossos",
    legalConnector: "e a",
  },
  apps: {
    title: "Aplicações",
    subtitle: "Escolha uma das ferramentas disponíveis. Este launcher será sua base de produtividade pessoal.",
    comingSoon: "Em breve",
    switcherTitle: "Aplicações",
    switcherEditLabel: "Editar favoritos",
    shortDescriptions: {
      loans: "Acompanhe dinheiro emprestado e recebido.",
      dates: "Lembre datas e eventos importantes.",
      links: "Salve e organize seus bookmarks.",
      domains: "Gerencie seu portfólio de domínios.",
    },
    userMenu: {
      label: "Usuário",
      profile: "Perfil",
      account: "Conta",
      logout: "Sair",
    },
  },
  legal: {
    privacy: {
      title: "Política de Privacidade",
      lastUpdated: "Última atualização: abril de 2026",
    },
    terms: {
      title: "Termos de Serviço",
      lastUpdated: "Última atualização: abril de 2026",
    },
  },
} as const;
