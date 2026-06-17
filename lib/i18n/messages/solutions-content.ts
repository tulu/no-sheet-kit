import type { AppId } from "@/lib/apps/catalog";

export type SolutionPageCopy = {
  h1: string;
  subtitle: string;
  intent: string;
  benefits: string[];
  vsAlternatives: { title: string; items: string[] };
  ctaOpen: string;
  ctaDocs: string;
  ctaLogin: string;
  relatedTitle: string;
  learnMore: string;
};

export type SolutionsMessages = {
  nav: { allSolutions: string };
  index: {
    h1: string;
    subtitle: string;
    intro: string;
  };
  pages: Record<AppId, SolutionPageCopy>;
  imagePlaceholderTitle: string;
  imagePlaceholderHint: string;
};

const enPages: Record<AppId, SolutionPageCopy> = {
  dates: {
    h1: "Birthday & anniversary reminder in your browser",
    subtitle: "A private birthday reminder app—no account, no subscription, no spreadsheet.",
    intent:
      "Looking for a birthday reminder or anniversary tracker that stays on your device? NSKDates keeps every important date in one calm view and optionally mirrors reminders to your own Google Calendar.",
    benefits: [
      "Store birthdays, anniversaries, and one-off milestones with list, grid, and month views",
      "See what is coming up next without opening a generic calendar app",
      "Optional Google sign-in: mirror dates as events in Google Calendar for email reminders",
      "Data stays in your browser by default—nothing uploaded to a NoSheetKit server",
    ],
    vsAlternatives: {
      title: "Why not a spreadsheet or a generic reminder app?",
      items: [
        "Unlike spreadsheet templates, dates are structured fields with upcoming views—not fragile rows",
        "Unlike heavy SaaS planners, there is no monthly fee and no vendor database of your contacts",
        "Unlike phone-only reminders, you control optional Calendar sync from your Google account",
      ],
    },
    ctaOpen: "Open NSKDates",
    ctaDocs: "Read documentation",
    ctaLogin: "Get started free",
    relatedTitle: "More focused mini-apps",
    learnMore: "Learn more about this app",
  },
  domains: {
    h1: "Domain portfolio manager in your browser",
    subtitle: "Track registrars, renewals, and notes—without a spreadsheet or hosted database.",
    intent:
      "Searching for a domain portfolio manager or renewal tracker? NSKDomains gives you one private view of every domain you own, with renewal dates you will not lose to expiry.",
    benefits: [
      "Domain and registrar fields with list, grid, and month views for renewals",
      "Track expiry and renewal dates with notes per domain",
      "Optional Google Calendar sync for renewal reminders after you sign in",
      "Local-first storage—your portfolio stays on your device until you export",
    ],
    vsAlternatives: {
      title: "Why not registrar dashboards or spreadsheets?",
      items: [
        "Unlike scattered registrar UIs, see every domain in one portfolio regardless of provider",
        "Unlike spreadsheet trackers, renewal views and fields are built for domains—not manual formulas",
        "Unlike enterprise domain tools, there is no per-seat subscription for personal portfolios",
      ],
    },
    ctaOpen: "Open NSKDomains",
    ctaDocs: "Read documentation",
    ctaLogin: "Get started free",
    relatedTitle: "More focused mini-apps",
    learnMore: "Learn more about this app",
  },
  loans: {
    h1: "Loan tracker for money you lend and borrow",
    subtitle: "A simple loan tracker with balances and partial payments—private in your browser.",
    intent:
      "Need a loan tracker or expense-style log for money between friends? NSKLoans tracks what you lent, what you borrowed, due dates, and partial repayments without turning it into accounting software.",
    benefits: [
      "Separate loans you give and receive with a clear running balance",
      "Record partial repayments and full payoff history per loan",
      "Optional due dates mirrored to Google Calendar when you sign in",
      "No hosted ledger—your financial notes stay in local storage by default",
    ],
    vsAlternatives: {
      title: "Why not a spreadsheet or a full expense app?",
      items: [
        "Unlike generic expense trackers, the focus is interpersonal loans—not every coffee purchase",
        "Unlike shared spreadsheets, balances and payments are structured with less formula risk",
        "Unlike paid finance apps, there is no subscription to track informal lending",
      ],
    },
    ctaOpen: "Open NSKLoans",
    ctaDocs: "Read documentation",
    ctaLogin: "Get started free",
    relatedTitle: "More focused mini-apps",
    learnMore: "Learn more about this app",
  },
  links: {
    h1: "Bookmark manager with tags and metadata",
    subtitle: "Save links with previews, tags, and review status—organized in your browser.",
    intent:
      "Want a bookmark manager or link organizer better than browser folders? NSKLinks saves URLs with automatic metadata, tags, and filters so important links stay findable.",
    benefits: [
      "Save URLs with titles, tags, and optional preview metadata enrichment",
      "Filter by tags, review status, or revisit dates",
      "Search your library quickly without a social bookmarking service",
      "Private by default—your reading list stays on your device",
    ],
    vsAlternatives: {
      title: "Why not browser bookmarks or Notion?",
      items: [
        "Unlike flat browser bookmarks, tags and review states help you maintain a real library",
        "Unlike Notion pages, links are first-class with metadata—not buried in workspaces",
        "Unlike read-later SaaS, there is no subscription to save personal URLs",
      ],
    },
    ctaOpen: "Open NSKLinks",
    ctaDocs: "Read documentation",
    ctaLogin: "Get started free",
    relatedTitle: "More focused mini-apps",
    learnMore: "Learn more about this app",
  },
  tasks: {
    h1: "Simple task tracker with Kanban boards",
    subtitle: "Spaces, Kanban or list views, due dates, and comments—without project-management bloat.",
    intent:
      "Looking for a simple task tracker or lightweight Kanban board? NSKTasks splits work across spaces with drag-and-drop boards that stay local until you choose Google backup.",
    benefits: [
      "Spaces for personal, work, or side projects",
      "Kanban and list views with drag-and-drop ordering",
      "Due dates, comments, and archive when done",
      "Local-only task data in your browser—no PM suite required",
    ],
    vsAlternatives: {
      title: "Why not Jira, Trello, or a todo spreadsheet?",
      items: [
        "Unlike team PM tools, NSKTasks is sized for personal tracking—not sprint ceremonies",
        "Unlike spreadsheet task lists, boards and statuses are native—not manual columns",
        "Unlike freemium boards with limits, core tracking has no hosted-database lock-in",
      ],
    },
    ctaOpen: "Open NSKTasks",
    ctaDocs: "Read documentation",
    ctaLogin: "Get started free",
    relatedTitle: "More focused mini-apps",
    learnMore: "Learn more about this app",
  },
  collections: {
    h1: "Collection tracker for what you own, lent, or want",
    subtitle: "Named collections with possession status—games, books, gear, and more.",
    intent:
      "Need a collection tracker or inventory-style list without a full asset database? NSKCollections groups items and shows what you own, lent, borrowed, or still want in one table.",
    benefits: [
      "Named collections with list or grid view",
      "Per-item status: owned, lent out, borrowed, or wanted",
      "Optional person, date, notes, price, and link fields per collection",
      "Stays in your browser—no catalog service uploading your stuff",
    ],
    vsAlternatives: {
      title: "Why not a spreadsheet or a collector SaaS?",
      items: [
        "Unlike spreadsheets, possession states and collection names are built-in fields",
        "Unlike collector platforms, your inventory is not published to a social feed",
        "Unlike rental ERP tools, the scope is personal collections—not warehouse stock",
      ],
    },
    ctaOpen: "Open NSKCollections",
    ctaDocs: "Read documentation",
    ctaLogin: "Get started free",
    relatedTitle: "More focused mini-apps",
    learnMore: "Learn more about this app",
  },
  tracker: {
    h1: "Activity tracker for days you want to remember",
    subtitle: "A simple day log, private in your browser.",
    intent:
      "Need a simple log without a spreadsheet? NSKTracker lets you mark days in named tracks with optional times. Grid, table, and month calendar included.",
    benefits: [
      "Named tracks for anything you log over time",
      "Grid, table, and calendar views; multiple marks per day allowed",
      "Optional start and end times on each mark",
      "Local-first. No Google Calendar sync in this app.",
    ],
    vsAlternatives: {
      title: "Why not a spreadsheet or a subscription app?",
      items: [
        "Unlike spreadsheet rows, dates and optional times are structured fields with a calendar view",
        "Unlike subscription trackers, your log stays on your device by default",
        "Unlike Google Calendar, this records what happened. It is not a reminder system.",
      ],
    },
    ctaOpen: "Open NSKTracker",
    ctaDocs: "Read documentation",
    ctaLogin: "Get started free",
    relatedTitle: "More focused mini-apps",
    learnMore: "Learn more about this app",
  },
  events: {
    h1: "Personal event planner in your browser",
    subtitle: "Guests, tasks, and expenses—private, no spreadsheet.",
    intent:
      "Planning a party, wedding, or reunion? NSKEvents keeps guest lists with families, a simple task kanban, and expense tracking with partial payments—all on your device.",
    benefits: [
      "Events sidebar with optional date, time, and location",
      "Info dashboard with RSVP, invitations, tasks, and expenses by currency",
      "Guest lists with families, filters, and card or table views",
      "Export filtered guest lists to Excel with event name, date, and location",
      "Tasks powered by NSKTasks (kanban, list, calendar) plus multi-currency expenses with partial payments",
    ],
    vsAlternatives: {
      title: "Why not a spreadsheet or a heavy planning app?",
      items: [
        "Unlike spreadsheet templates, guests, tasks, and expenses are structured—not fragile rows",
        "Unlike subscription event apps, there is no monthly fee and no vendor database of your guests",
        "Unlike paper lists, invitation status and expense balances stay in sync as you edit",
      ],
    },
    ctaOpen: "Open NSKEvents",
    ctaDocs: "Read documentation",
    ctaLogin: "Get started free",
    relatedTitle: "More focused mini-apps",
    learnMore: "Learn more about this app",
  },
};

const esPages: Record<AppId, SolutionPageCopy> = {
  dates: {
    h1: "Recordatorio de cumpleaños y aniversarios en el navegador",
    subtitle: "Un recordatorio privado—sin cuenta, sin suscripción, sin hoja de cálculo.",
    intent:
      "¿Buscas un recordatorio de cumpleaños o un seguimiento de aniversarios que quede en tu dispositivo? NSKDates concentra fechas importantes y, si quieres, las refleja en tu Google Calendar.",
    benefits: [
      "Guarda cumpleaños, aniversarios y fechas puntuales con vistas de lista, cuadrícula y mes",
      "Ve qué se acerca sin abrir una app de calendario genérica",
      "Opcional con Google: eventos en Calendar para recordatorios por correo",
      "Los datos permanecen en el navegador por defecto",
    ],
    vsAlternatives: {
      title: "¿Por qué no una hoja de cálculo o una app genérica?",
      items: [
        "A diferencia de plantillas Excel, hay campos y vistas de próximas fechas",
        "Sin cuotas mensivas ni base de datos del proveedor con tus contactos",
        "Tú controlas la sincronización opcional con Calendar",
      ],
    },
    ctaOpen: "Abrir NSKDates",
    ctaDocs: "Ver documentación",
    ctaLogin: "Empezar gratis",
    relatedTitle: "Más mini-apps enfocadas",
    learnMore: "Más sobre esta app",
  },
  domains: {
    h1: "Gestor de portfolio de dominios en el navegador",
    subtitle: "Registradores, renovaciones y notas—sin hoja de cálculo ni base de datos alojada.",
    intent:
      "¿Buscas un gestor de dominios o seguimiento de renovaciones? NSKDomains reúne tu portfolio privado para no perder dominios por caducidad.",
    benefits: [
      "Campos de dominio y registrador con vistas de lista, cuadrícula y mes",
      "Seguimiento de caducidad y renovación con notas",
      "Opcional: recordatorios en Google Calendar tras iniciar sesión",
      "Almacenamiento local por defecto",
    ],
    vsAlternatives: {
      title: "¿Por qué no paneles de registradores o Excel?",
      items: [
        "Todos los dominios en un solo lugar, sin importar el registrador",
        "Vistas pensadas para renovaciones, no fórmulas manuales",
        "Sin suscripción enterprise para portfolios personales",
      ],
    },
    ctaOpen: "Abrir NSKDomains",
    ctaDocs: "Ver documentación",
    ctaLogin: "Empezar gratis",
    relatedTitle: "Más mini-apps enfocadas",
    learnMore: "Más sobre esta app",
  },
  loans: {
    h1: "Seguimiento de préstamos entre personas",
    subtitle: "Préstamos dados y recibidos con pagos parciales—privado en el navegador.",
    intent:
      "¿Necesitas un seguimiento de préstamos o deudas informales? NSKLoans registra saldos y pagos sin convertirse en software contable.",
    benefits: [
      "Separa préstamos que das y que recibes con saldo claro",
      "Pagos parciales e historial de liquidación",
      "Fechas de vencimiento opcionales en Google Calendar",
      "Sin libro mayor alojado—tus notas quedan en local",
    ],
    vsAlternatives: {
      title: "¿Por qué no Excel o una app de gastos completa?",
      items: [
        "Enfocado en préstamos entre personas, no en cada gasto diario",
        "Estructura de pagos sin fórmulas frágiles",
        "Sin suscripción para deudas informales",
      ],
    },
    ctaOpen: "Abrir NSKLoans",
    ctaDocs: "Ver documentación",
    ctaLogin: "Empezar gratis",
    relatedTitle: "Más mini-apps enfocadas",
    learnMore: "Más sobre esta app",
  },
  links: {
    h1: "Gestor de marcadores con etiquetas y metadatos",
    subtitle: "Guarda enlaces con vista previa, etiquetas y estado de revisión.",
    intent:
      "¿Quieres organizar enlaces mejor que las carpetas del navegador? NSKLinks guarda URLs con metadatos y filtros para encontrar lo importante.",
    benefits: [
      "URLs con títulos, etiquetas y metadatos opcionales",
      "Filtra por etiquetas, revisión o fechas de revisita",
      "Búsqueda rápida sin servicio social de marcadores",
      "Privado por defecto en tu dispositivo",
    ],
    vsAlternatives: {
      title: "¿Por qué no marcadores del navegador o Notion?",
      items: [
        "Etiquetas y estados de revisión para una biblioteca real",
        "Enlaces como ciudadanos de primera clase, no páginas perdidas",
        "Sin suscripción para URLs personales",
      ],
    },
    ctaOpen: "Abrir NSKLinks",
    ctaDocs: "Ver documentación",
    ctaLogin: "Empezar gratis",
    relatedTitle: "Más mini-apps enfocadas",
    learnMore: "Más sobre esta app",
  },
  tasks: {
    h1: "Gestor de tareas simple con tablero Kanban",
    subtitle: "Espacios, Kanban o lista, fechas y comentarios—sin bloat de gestión de proyectos.",
    intent:
      "¿Buscas un gestor de tareas ligero o tablero Kanban? NSKTasks organiza espacios con arrastrar y soltar, con datos locales.",
    benefits: [
      "Espacios para personal, trabajo o proyectos",
      "Vistas Kanban y lista con orden por arrastre",
      "Fechas límite, comentarios y archivo al terminar",
      "Datos de tareas en el navegador",
    ],
    vsAlternatives: {
      title: "¿Por qué no Jira, Trello o Excel?",
      items: [
        "Pensado para uso personal, no ceremonias de sprint",
        "Tableros nativos, no columnas manuales",
        "Sin límites freemium de tableros alojados",
      ],
    },
    ctaOpen: "Abrir NSKTasks",
    ctaDocs: "Ver documentación",
    ctaLogin: "Empezar gratis",
    relatedTitle: "Más mini-apps enfocadas",
    learnMore: "Más sobre esta app",
  },
  collections: {
    h1: "Seguimiento de colecciones: tuyo, prestado o deseado",
    subtitle: "Colecciones con estado de posesión—juegos, libros, equipo y más.",
    intent:
      "¿Necesitas inventariar colecciones sin un ERP? NSKCollections agrupa ítems y muestra qué tienes, prestaste, pediste prestado o quieres.",
    benefits: [
      "Colecciones con vista de lista o cuadrícula",
      "Estados: propio, prestado, pedido prestado o deseado",
      "Campos opcionales de persona, fecha, notas, precio y enlace",
      "Permanece en el navegador",
    ],
    vsAlternatives: {
      title: "¿Por qué no Excel o una plataforma de coleccionistas?",
      items: [
        "Estados de posesión integrados, no celdas sueltas",
        "Tu inventario no se publica en un feed social",
        "Alcance personal, no almacén",
      ],
    },
    ctaOpen: "Abrir NSKCollections",
    ctaDocs: "Ver documentación",
    ctaLogin: "Empezar gratis",
    relatedTitle: "Más mini-apps enfocadas",
    learnMore: "Más sobre esta app",
  },
  tracker: {
    h1: "Registro de actividad para los días que quieres anotar",
    subtitle: "Un registro de días sencillo, privado en el navegador.",
    intent:
      "¿Buscas un registro simple sin hoja de cálculo? NSKTracker te deja marcar días en seguimientos con horarios opcionales. Cuadrícula, tabla y calendario mensual incluidos.",
    benefits: [
      "Seguimientos con nombre para lo que quieras registrar",
      "Vistas cuadrícula, tabla y calendario; varios registros el mismo día",
      "Hora de inicio y fin opcionales en cada marca",
      "Local por defecto. Sin sincronización con Google Calendar.",
    ],
    vsAlternatives: {
      title: "¿Por qué no una hoja de cálculo o una app de pago?",
      items: [
        "A diferencia de filas sueltas, hay campos de fecha y hora opcionales con vista calendario",
        "A diferencia de apps con suscripción, tu registro queda en el dispositivo",
        "A diferencia de Google Calendar, esto registra lo que pasó. No es un sistema de recordatorios.",
      ],
    },
    ctaOpen: "Abrir NSKTracker",
    ctaDocs: "Ver documentación",
    ctaLogin: "Empezar gratis",
    relatedTitle: "Más mini-apps enfocadas",
    learnMore: "Más sobre esta app",
  },
  events: {
    h1: "Planificador de eventos personales en el navegador",
    subtitle: "Invitados, tareas y gastos—privado, sin hoja de cálculo.",
    intent:
      "¿Organizas una fiesta, boda o reunión? NSKEvents reúne listas de invitados con familias, un kanban de tareas sencillo y gastos con pagos parciales—todo en tu dispositivo.",
    benefits: [
      "Barra lateral de eventos con fecha, hora y ubicación opcionales",
      "Panel de información con confirmación, invitaciones, tareas y gastos por moneda",
      "Listas de invitados con familias, filtros y vista en tarjetas o tabla",
      "Exporta listas filtradas de invitados a Excel con nombre, fecha y lugar del evento",
      "Tareas con NSKTasks (kanban, lista, calendario) y gastos multi-moneda con pagos parciales",
    ],
    vsAlternatives: {
      title: "¿Por qué no una hoja de cálculo o una app pesada de planificación?",
      items: [
        "A diferencia de plantillas, invitados, tareas y gastos son campos estructurados",
        "A diferencia de apps de pago, no hay suscripción ni base de datos del proveedor con tus invitados",
        "A diferencia de listas en papel, el estado de invitaciones y saldos se mantienen al editar",
      ],
    },
    ctaOpen: "Abrir NSKEvents",
    ctaDocs: "Ver documentación",
    ctaLogin: "Empezar gratis",
    relatedTitle: "Más mini-apps enfocadas",
    learnMore: "Más sobre esta app",
  },
};

const ptPages: Record<AppId, SolutionPageCopy> = {
  dates: {
    h1: "Lembrete de aniversários no navegador",
    subtitle: "Lembretes privados—sem conta, sem assinatura, sem planilha.",
    intent:
      "Procura um lembrete de aniversários que fique no seu dispositivo? O NSKDates reúne datas importantes e pode espelhar lembretes no seu Google Calendar.",
    benefits: [
      "Aniversários, datas comemorativas e marcos com listas, grade e mês",
      "Veja o que vem a seguir sem abrir um calendário genérico",
      "Opcional com Google: eventos no Calendar",
      "Dados no navegador por padrão",
    ],
    vsAlternatives: {
      title: "Por que não planilha ou app genérico?",
      items: [
        "Campos e vistas de próximas datas, não linhas frágeis",
        "Sem mensalidade nem base do fornecedor com seus contatos",
        "Você controla a sincronização opcional",
      ],
    },
    ctaOpen: "Abrir NSKDates",
    ctaDocs: "Ver documentação",
    ctaLogin: "Começar grátis",
    relatedTitle: "Mais mini-apps focadas",
    learnMore: "Saiba mais sobre este app",
  },
  domains: {
    h1: "Gestor de portfólio de domínios no navegador",
    subtitle: "Registradores, renovações e notas—sem planilha nem base hospedada.",
    intent:
      "Procura um gestor de domínios ou controle de renovações? O NSKDomains mantém seu portfólio privado para não perder domínios.",
    benefits: [
      "Domínio e registrador com listas, grade e mês",
      "Acompanhe expiração e renovação com notas",
      "Opcional: lembretes no Google Calendar",
      "Armazenamento local por padrão",
    ],
    vsAlternatives: {
      title: "Por que não painéis de registrador ou Excel?",
      items: [
        "Todos os domínios num só lugar",
        "Vistas para renovação, não fórmulas manuais",
        "Sem assinatura enterprise para uso pessoal",
      ],
    },
    ctaOpen: "Abrir NSKDomains",
    ctaDocs: "Ver documentação",
    ctaLogin: "Começar grátis",
    relatedTitle: "Mais mini-apps focadas",
    learnMore: "Saiba mais sobre este app",
  },
  loans: {
    h1: "Controle de empréstimos entre pessoas",
    subtitle: "Dinheiro emprestado e devido com pagamentos parciais—privado no navegador.",
    intent:
      "Precisa rastrear empréstimos informais? O NSKLoans registra saldos e pagamentos sem virar software contábil.",
    benefits: [
      "Separe o que você empresta e o que deve com saldo claro",
      "Pagamentos parciais e histórico de quitação",
      "Vencimentos opcionais no Google Calendar",
      "Sem livro razão hospedado",
    ],
    vsAlternatives: {
      title: "Por que não planilha ou app de despesas completo?",
      items: [
        "Foco em empréstimos pessoais, não em cada café",
        "Pagamentos estruturados sem fórmulas frágeis",
        "Sem assinatura para dívidas informais",
      ],
    },
    ctaOpen: "Abrir NSKLoans",
    ctaDocs: "Ver documentação",
    ctaLogin: "Começar grátis",
    relatedTitle: "Mais mini-apps focadas",
    learnMore: "Saiba mais sobre este app",
  },
  links: {
    h1: "Gerenciador de favoritos com tags e metadados",
    subtitle: "Salve links com prévia, tags e status de revisão.",
    intent:
      "Quer organizar links melhor que pastas do navegador? O NSKLinks guarda URLs com metadados e filtros.",
    benefits: [
      "URLs com títulos, tags e metadados opcionais",
      "Filtre por tags, revisão ou datas de revisita",
      "Busca rápida sem serviço social",
      "Privado por padrão no dispositivo",
    ],
    vsAlternatives: {
      title: "Por que não favoritos do navegador ou Notion?",
      items: [
        "Tags e estados de revisão para uma biblioteca real",
        "Links em primeiro lugar, não páginas perdidas",
        "Sem assinatura para URLs pessoais",
      ],
    },
    ctaOpen: "Abrir NSKLinks",
    ctaDocs: "Ver documentação",
    ctaLogin: "Começar grátis",
    relatedTitle: "Mais mini-apps focadas",
    learnMore: "Saiba mais sobre este app",
  },
  tasks: {
    h1: "Gestor de tarefas simples com Kanban",
    subtitle: "Espaços, Kanban ou lista, prazos e comentários—sem excesso de PM.",
    intent:
      "Procura um gestor de tarefas leve ou quadro Kanban? O NSKTasks organiza espaços com arrastar e soltar, localmente.",
    benefits: [
      "Espaços para vida pessoal, trabalho ou projetos",
      "Kanban e lista com ordenação por arraste",
      "Prazos, comentários e arquivo ao concluir",
      "Dados de tarefas no navegador",
    ],
    vsAlternatives: {
      title: "Por que não Jira, Trello ou planilha?",
      items: [
        "Para uso pessoal, não cerimônias de sprint",
        "Quadros nativos, não colunas manuais",
        "Sem limites freemium de ferramentas hospedadas",
      ],
    },
    ctaOpen: "Abrir NSKTasks",
    ctaDocs: "Ver documentação",
    ctaLogin: "Começar grátis",
    relatedTitle: "Mais mini-apps focadas",
    learnMore: "Saiba mais sobre este app",
  },
  collections: {
    h1: "Controle de coleções: seu, emprestado ou desejado",
    subtitle: "Coleções com status de posse—jogos, livros, equipamentos e mais.",
    intent:
      "Precisa inventariar coleções sem um ERP? O NSKCollections agrupa itens e mostra o que você tem, emprestou, pegou emprestado ou quer.",
    benefits: [
      "Coleções em lista ou grade",
      "Status: próprio, emprestado, pedido emprestado ou desejado",
      "Campos opcionais de pessoa, data, notas, preço e link",
      "Fica no navegador",
    ],
    vsAlternatives: {
      title: "Por que não planilha ou plataforma de colecionador?",
      items: [
        "Estados de posse integrados",
        "Seu inventário não vira feed social",
        "Escopo pessoal, não armazém",
      ],
    },
    ctaOpen: "Abrir NSKCollections",
    ctaDocs: "Ver documentação",
    ctaLogin: "Começar grátis",
    relatedTitle: "Mais mini-apps focadas",
    learnMore: "Saiba mais sobre este app",
  },
  tracker: {
    h1: "Registro de atividade para os dias que você quer anotar",
    subtitle: "Um registro de dias simples, privado no navegador.",
    intent:
      "Precisa de um registro simples sem planilha? O NSKTracker marca dias em acompanhamentos com horários opcionais. Grade, tabela e calendário mensal incluídos.",
    benefits: [
      "Acompanhamentos nomeados para o que você quiser registrar",
      "Visualizações em grade, tabela e calendário; vários registros no mesmo dia",
      "Horário de início e fim opcionais em cada marca",
      "Local por padrão. Sem sincronização com o Google Calendar.",
    ],
    vsAlternatives: {
      title: "Por que não planilha ou app pago?",
      items: [
        "Diferente de linhas soltas, há campos de data e hora opcionais com vista de calendário",
        "Diferente de apps com assinatura, seu registro fica no dispositivo",
        "Diferente do Google Calendar, isso registra o que aconteceu. Não é um sistema de lembretes.",
      ],
    },
    ctaOpen: "Abrir NSKTracker",
    ctaDocs: "Ver documentação",
    ctaLogin: "Começar grátis",
    relatedTitle: "Mais mini-apps focadas",
    learnMore: "Saiba mais sobre este app",
  },
  events: {
    h1: "Planejador de eventos pessoais no navegador",
    subtitle: "Convidados, tarefas e despesas—privado, sem planilha.",
    intent:
      "Organizando uma festa, casamento ou reunião? O NSKEvents reúne listas de convidados com famílias, um kanban de tarefas simples e despesas com pagamentos parciais—tudo no seu dispositivo.",
    benefits: [
      "Barra lateral de eventos com data, hora e local opcionais",
      "Painel de informações com confirmação, convites, tarefas e despesas por moeda",
      "Listas de convidados com famílias, filtros e vista em cartões ou tabela",
      "Exporte listas filtradas de convidados para Excel com nome, data e local do evento",
      "Tarefas com NSKTasks (kanban, lista, calendário) e despesas multi-moeda com pagamentos parciais",
    ],
    vsAlternatives: {
      title: "Por que não planilha ou app pesado de planejamento?",
      items: [
        "Diferente de modelos, convidados, tarefas e despesas são campos estruturados",
        "Diferente de apps pagos, não há assinatura nem base do fornecedor com seus convidados",
        "Diferente de listas em papel, status de convites e saldos ficam sincronizados ao editar",
      ],
    },
    ctaOpen: "Abrir NSKEvents",
    ctaDocs: "Ver documentação",
    ctaLogin: "Começar grátis",
    relatedTitle: "Mais mini-apps focadas",
    learnMore: "Saiba mais sobre este app",
  },
};

export const solutionsMessagesEn: SolutionsMessages = {
  nav: { allSolutions: "All solutions" },
  index: {
    h1: "Focused mini-apps for everyday tracking",
    subtitle: "Private browser tools—no spreadsheet, no subscription.",
    intro: "Each page explains one NoSheetKit app and who it is for. Pick what you need and open it in your browser.",
  },
  pages: enPages,
  imagePlaceholderTitle: "Screenshot placeholder",
  imagePlaceholderHint:
    "Add a PNG at public/docs/applications/{id}.png — it will be served at /docs/applications/{id}.png",
};

export const solutionsMessagesEs: SolutionsMessages = {
  nav: { allSolutions: "Todas las soluciones" },
  index: {
    h1: "Mini-apps enfocadas para el día a día",
    subtitle: "Herramientas privadas en el navegador—sin hoja de cálculo ni suscripción.",
    intro: "Cada página explica una app de NoSheetKit y para quién es. Elige lo que necesitas y ábrela en el navegador.",
  },
  pages: esPages,
  imagePlaceholderTitle: "Captura pendiente",
  imagePlaceholderHint:
    "Añade un PNG en public/docs/applications/{id}.png — se servirá en /docs/applications/{id}.png",
};

export const solutionsMessagesPt: SolutionsMessages = {
  nav: { allSolutions: "Todas as soluções" },
  index: {
    h1: "Mini-apps focadas para o dia a dia",
    subtitle: "Ferramentas privadas no navegador—sem planilha nem assinatura.",
    intro: "Cada página explica um app do NoSheetKit e para quem ele serve. Escolha o que precisa e abra no navegador.",
  },
  pages: ptPages,
  imagePlaceholderTitle: "Captura pendente",
  imagePlaceholderHint:
    "Adicione um PNG em public/docs/applications/{id}.png — será servido em /docs/applications/{id}.png",
};
