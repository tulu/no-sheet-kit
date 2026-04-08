import type { LegalDocument } from "./types";

export const privacyPt: LegalDocument = {
  locale: "pt",
  sections: [
    {
      title: "Resumo rápido",
      paragraphs: [
        "O NoSheetKit não coleta, armazena nem transmite seus dados pessoais para servidores próprios.",
        "Seus dados ficam no localStorage do navegador. Se você ativar sincronização com Google Drive, eles ficam na sua própria conta Google.",
      ],
    },
    {
      title: "Armazenamento de dados",
      paragraphs: [
        "Todos os dados são salvos localmente no navegador usando localStorage.",
        "Os dados só saem do seu dispositivo se você ativar explicitamente o backup no Google Drive.",
      ],
    },
    {
      title: "Login com Google (opcional)",
      paragraphs: [
        "Autenticar com Google é opcional.",
        "Quando ativado, o NoSheetKit solicita apenas os escopos necessários para appDataFolder do Drive e eventos do Calendar.",
      ],
      bullets: [
        "Ler/gravar arquivos no appDataFolder do Google Drive (área oculta privada do app).",
        "Criar e gerenciar eventos em um calendário dedicado do NoSheetKit.",
      ],
    },
    {
      title: "Backup no Google Drive (opcional)",
      paragraphs: [
        "Backups são salvos como arquivos JSON no appDataFolder, área oculta oferecida pelo Google para dados específicos de aplicativos.",
        "Essa área não aparece na navegação normal do Drive e não é compartilhada com outros apps.",
      ],
      externalLink: {
        href: "https://myaccount.google.com/permissions",
        label: "Permissões da Conta Google",
        trailingText: "Você pode revogar o acesso a qualquer momento.",
      },
    },
    {
      title: "Lembretes no Google Calendar (opcional)",
      paragraphs: [
        "Quando ativado, eventos de lembrete são criados em um calendário dedicado do NoSheetKit na sua conta Google.",
      ],
    },
    {
      title: "Analytics e rastreamento",
      paragraphs: [
        "O NoSheetKit não inclui analytics, rastreadores de anúncios ou scripts de perfilamento.",
      ],
    },
    {
      title: "Código aberto",
      paragraphs: [
        "O código-fonte completo está publicamente disponível no GitHub.",
      ],
      externalLink: {
        href: "https://github.com/tulu/no-sheet-kit",
        label: "github.com/tulu/no-sheet-kit",
      },
    },
    {
      title: "Contato",
      paragraphs: [
        "Para dúvidas sobre privacidade, abra uma issue no repositório.",
      ],
    },
  ],
};
