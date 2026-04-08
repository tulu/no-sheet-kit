import type { LegalDocument } from "./types";

export const termsPt: LegalDocument = {
  locale: "pt",
  sections: [
    {
      title: "Aceitação",
      paragraphs: [
        "Ao usar o NoSheetKit, você concorda com estes termos. Se não concordar, não use a aplicação.",
      ],
    },
    {
      title: "O que é o NoSheetKit",
      paragraphs: [
        "NoSheetKit é um toolkit de produtividade gratuito e open source.",
        "Ele é fornecido no estado em que se encontra, sem garantias de disponibilidade, precisão ou adequação para um fim específico.",
      ],
    },
    {
      title: "Responsabilidade pelos seus dados",
      paragraphs: [
        "Você é responsável por seus backups e pela integridade dos seus dados.",
        "Limpar o armazenamento do navegador pode remover permanentemente os dados locais.",
      ],
    },
    {
      title: "Integrações com Google",
      paragraphs: [
        "O uso de Google Sign-In, Google Drive e Google Calendar no NoSheetKit está sujeito aos termos do Google.",
      ],
      externalLink: {
        href: "https://policies.google.com/terms",
        label: "Termos de Serviço do Google",
      },
    },
    {
      title: "Uso aceitável",
      paragraphs: [
        "Você pode usar o NoSheetKit para fins legais.",
        "Você não pode usar o app para abusar de APIs de terceiros ou violar leis aplicáveis.",
      ],
    },
    {
      title: "Licença open source",
      paragraphs: [
        "NoSheetKit é distribuído sob licença MIT. Você pode fazer fork, modificar e hospedar por conta própria sob essa licença.",
      ],
      externalLink: {
        href: "https://github.com/tulu/no-sheet-kit",
        label: "Repositório do projeto",
      },
    },
    {
      title: "Isenção de garantias",
      paragraphs: [
        "NoSheetKit é fornecido \"como está\", sem garantias de qualquer tipo.",
      ],
    },
    {
      title: "Alterações destes termos",
      paragraphs: [
        "Estes termos podem ser atualizados com o tempo. O uso contínuo implica aceitação das atualizações futuras.",
      ],
    },
  ],
};
