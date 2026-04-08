import type { LegalDocument } from "./types";

export const privacyEs: LegalDocument = {
  locale: "es",
  sections: [
    {
      title: "Resumen corto",
      paragraphs: [
        "NoSheetKit no recopila, almacena ni transmite tus datos personales a ningún servidor.",
        "Tus datos viven en el localStorage del navegador. Si activás sincronización con Google Drive, los datos se guardan en tu propia cuenta de Google.",
      ],
    },
    {
      title: "Almacenamiento de datos",
      paragraphs: [
        "Toda la información se guarda localmente en tu navegador usando localStorage.",
        "Los datos solo salen de tu dispositivo si activás explícitamente el backup en Google Drive.",
      ],
    },
    {
      title: "Inicio de sesión con Google (opcional)",
      paragraphs: [
        "La autenticación con Google es opcional.",
        "Si la activás, NoSheetKit solicita solo los permisos necesarios para appDataFolder de Drive y eventos de Calendar.",
      ],
      bullets: [
        "Leer/escribir archivos en appDataFolder de Google Drive (espacio oculto privado de la app).",
        "Crear y administrar eventos en un calendario dedicado de NoSheetKit.",
      ],
    },
    {
      title: "Backup en Google Drive (opcional)",
      paragraphs: [
        "Los backups se guardan como archivos JSON en appDataFolder, un espacio oculto que Google provee para datos específicos de apps.",
        "Este espacio no aparece en la vista normal de Drive y no se comparte con otras apps.",
      ],
      externalLink: {
        href: "https://myaccount.google.com/permissions",
        label: "Permisos de tu cuenta de Google",
        trailingText: "Podés revocar el acceso en cualquier momento.",
      },
    },
    {
      title: "Recordatorios con Google Calendar (opcional)",
      paragraphs: [
        "Si lo activás, se crean eventos de recordatorio en un calendario dedicado de NoSheetKit dentro de tu cuenta de Google.",
      ],
    },
    {
      title: "Analítica y seguimiento",
      paragraphs: [
        "NoSheetKit no incluye analítica, trackers publicitarios ni scripts de perfilado.",
      ],
    },
    {
      title: "Código abierto",
      paragraphs: ["El código fuente completo está disponible públicamente en GitHub."],
      externalLink: {
        href: "https://github.com/tulu/no-sheet-kit",
        label: "github.com/tulu/no-sheet-kit",
      },
    },
    {
      title: "Contacto",
      paragraphs: [
        "Si tenés preguntas sobre privacidad, abrí un issue en el repositorio.",
      ],
    },
  ],
};
