import type { LegalDocument } from "./types";

export const termsEs: LegalDocument = {
  locale: "es",
  sections: [
    {
      title: "Aceptación",
      paragraphs: [
        "Al usar NoSheetKit, aceptás estos términos. Si no estás de acuerdo, no uses la aplicación.",
      ],
    },
    {
      title: "Qué es NoSheetKit",
      paragraphs: [
        "NoSheetKit es un kit de productividad gratuito y open source.",
        "Se ofrece tal cual, sin garantías de disponibilidad, exactitud o adecuación para un propósito específico.",
      ],
    },
    {
      title: "Responsabilidad sobre tus datos",
      paragraphs: [
        "Sos responsable por tus copias de seguridad y por la integridad de tus datos.",
        "Si borrás el almacenamiento del navegador, los datos locales pueden perderse permanentemente.",
      ],
    },
    {
      title: "Integraciones con Google",
      paragraphs: [
        "El uso de Google Sign-In, Google Drive y Google Calendar en NoSheetKit está sujeto a los términos de Google.",
      ],
      externalLink: {
        href: "https://policies.google.com/terms",
        label: "Términos de servicio de Google",
      },
    },
    {
      title: "Uso aceptable",
      paragraphs: [
        "Podés usar NoSheetKit para fines legales.",
        "No podés usarlo para abusar APIs de terceros ni violar leyes aplicables.",
      ],
    },
    {
      title: "Licencia open source",
      paragraphs: [
        "NoSheetKit se distribuye bajo licencia MIT. Podés forkearlo, modificarlo y auto-hospedarlo bajo esa licencia.",
      ],
      externalLink: {
        href: "https://github.com/tulu/no-sheet-kit",
        label: "Repositorio del proyecto",
      },
    },
    {
      title: "Descargo de garantías",
      paragraphs: ["NoSheetKit se entrega \"tal cual\" y sin garantías de ningún tipo."],
    },
    {
      title: "Cambios a estos términos",
      paragraphs: [
        "Estos términos pueden actualizarse con el tiempo. El uso continuado implica aceptación de futuras actualizaciones.",
      ],
    },
  ],
};
