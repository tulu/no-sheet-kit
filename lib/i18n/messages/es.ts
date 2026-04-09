export const esMessages = {
  common: {
    localeLabel: "Idioma",
    localeShort: {
      en: "EN",
      es: "ES",
      pt: "PT",
    },
    backToNoSheetKit: "← Volver a NoSheetKit",
    home: "Home",
    getStarted: "Comenzar",
    privacy: "Privacidad",
    terms: "Términos",
    github: "GitHub",
    or: "o",
  },
  landing: {
    nav: {
      getStarted: "Comenzar",
    },
    hero: {
      titleStart: "Tu vida,",
      titleEmphasis: "no",
      titleEnd: "una hoja de cálculo.",
      description:
        "NoSheetKit es un kit personal para lo que realmente necesitás seguir, sin hojas de cálculo, cuentas, bases de datos ni cuotas mensuales.",
      exploreApps: "Explorar apps",
      viewGithub: "Ver en GitHub",
    },
    why: {
      titleStart: "Pensado para lo que",
      titleEmphasis: "se te puede",
      titleEnd: "escapar.",
      items: [
        {
          title: "Solo tuyo",
          body: "Tus datos viven en el localStorage del navegador y opcionalmente se sincronizan con tu Google Drive. Ningún servidor toca tu información.",
        },
        {
          title: "Sin backend, sin costos",
          body: "100% del lado del cliente. Sin suscripciones, sin cuentas que administrar y sin lock-in. Lo podés desplegar en minutos.",
        },
        {
          title: "Recordatorios que funcionan",
          body: "En vez de notificaciones push que requieren servidor, NoSheetKit crea eventos en tu Google Calendar con recordatorios por email.",
        },
        {
          title: "Modular por diseño",
          body: "Cada app es independiente. Usá una o todas. El sistema de diseño compartido hace que todo se sienta coherente.",
        },
      ],
    },
    apps: {
      titleStart: "Herramientas chicas,",
      titleEmphasis: "un",
      titleEnd: "kit coherente.",
      cards: {
        loans: {
          desc: "Seguí el dinero que prestás y el que pedís prestado. Sabé quién debe qué, cuándo vence y mantené un historial limpio.",
          features: [
            "Registrar préstamos que das y recibís",
            "Seguir pagos parciales",
            "Recordatorios de vencimiento por Google Calendar",
            "Historial completo de pagos",
          ],
        },
        dates: {
          desc: "No te olvides más de cumpleaños ni aniversarios. Guardá fechas importantes y dejá que Google Calendar te recuerde a tiempo.",
          features: [
            "Cumpleaños, aniversarios y más",
            "Recordatorios anuales recurrentes",
            "Alertas por email con Google Calendar",
            "Cuenta regresiva de días",
          ],
        },
        links: {
          desc: "Guardá y organizá tus links importantes en un solo lugar para encontrarlos rápido.",
          features: [
            "Guardar links útiles con título",
            "Agrupar links por tema",
            "Búsqueda y filtros rápidos",
            "Mantener recursos ordenados",
          ],
        },
        domains: {
          desc: "Controlá todos tus dominios en un solo lugar. Seguimiento de registradores, renovaciones, notas DNS y evitá vencimientos.",
          features: [
            "Registro de dominio + registrador",
            "Seguimiento de renovación",
            "Alertas de vencimiento por Google Calendar",
            "Notas de DNS y hosting",
          ],
        },
      },
      cta: "Comenzar",
    },
    how: {
      titleStart: "Simple por diseño,",
      titleEmphasis: "privado",
      titleEnd: "por defecto.",
      steps: [
        {
          n: "1",
          title: "Usalo al instante — sin login",
          body: "Abrí la app y empezá a cargar datos de inmediato. Todo se guarda localmente en el localStorage del navegador. Sin cuenta ni configuración.",
        },
        {
          n: "2",
          title: "Opcionalmente iniciá sesión con Google",
          body: "Si querés backups o recordatorios, iniciá sesión con Google. Eso habilita Drive y Calendar, pero nunca es obligatorio.",
        },
        {
          n: "3",
          title: "Hacé backup en tu propio Google Drive",
          body: "Si iniciás sesión, tus datos se pueden guardar como JSON en tu Drive. Los archivos son tuyos: NoSheetKit no guarda nada en servidores.",
        },
        {
          n: "4",
          title: "Recibí recordatorios por Google Calendar",
          body: "Fechas de vencimiento y eventos importantes crean entradas en un calendario dedicado de NoSheetKit. Requiere login con Google.",
        },
      ],
    },
    cta: {
      titleStart: "Empezá a seguir lo que",
      titleEmphasis: "de verdad",
      titleEnd: "importa.",
      description: "Tus datos, tu dispositivo. Sin cuentas obligatorias.",
      button: "Comenzar",
    },
    footer: {
      copyright: "© 2026 NoSheetKit",
    },
  },
  login: {
    title: "Bienvenido",
    description:
      "Iniciá sesión para sincronizar datos entre dispositivos con Google Drive, o continuá de forma privada solo con almacenamiento local.",
    continueWithGoogle: "Continuar con Google",
    continueAnonymously: "Continuar sin iniciar sesión",
    legalPrefix: "Al continuar aceptás nuestros",
    legalConnector: "y la",
  },
  apps: {
    title: "Aplicaciones",
    subtitle: "Elegí una de las herramientas disponibles. Este launcher va a ser tu espacio principal de productividad.",
    comingSoon: "Próximamente",
    shortDescriptions: {
      loans: "Seguí dinero prestado y recibido.",
      dates: "Recordá fechas y eventos importantes.",
      links: "Guardá y organizá tus bookmarks.",
      domains: "Gestioná tu portfolio de dominios.",
    },
    userMenu: {
      label: "Usuario",
      profile: "Perfil",
      account: "Cuenta",
      logout: "Cerrar sesión",
    },
  },
  legal: {
    privacy: {
      title: "Política de Privacidad",
      lastUpdated: "Última actualización: abril de 2026",
    },
    terms: {
      title: "Términos del Servicio",
      lastUpdated: "Última actualización: abril de 2026",
    },
  },
} as const;
