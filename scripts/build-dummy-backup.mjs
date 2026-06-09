/**
 * Builds a guest-compatible backup ZIP with dummy data
 *
 * Usage: `node scripts/build-dummy-backup.mjs`
 * Output: `public/demo/nosheetkit-dummy-data.zip`
 *
 * Restore: Apps → Settings → Data management → Restore from file (guest or Google session),
 * or the guest header restore control when local data is empty.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "demo");
const outFile = path.join(outDir, "nosheetkit-dummy-data.zip");

const T0 = "2026-01-10T10:00:00.000Z";
const T1 = "2026-01-12T14:30:00.000Z";

const spaceWork = "c0ffee00-0000-4000-8000-000000000001";
const spacePersonal = "c0ffee00-0000-4000-8000-000000000002";

const colGames = "dddd0001-0000-4000-8000-000000000001";
const colBooks = "dddd0002-0000-4000-8000-000000000002";

const trackMaintenance = "eeee0001-0000-4000-8000-000000000001";
const trackOutings = "eeee0002-0000-4000-8000-000000000002";
const trackSideProject = "eeee0003-0000-4000-8000-000000000003";
const trackReading = "eeee0004-0000-4000-8000-000000000004";

const loans = {
  version: 1,
  last_google_sync_at: null,
  items: [
    {
      id: "l0000001-0000-4000-8000-000000000001",
      direction: "lent",
      counterparty_name: "Alex Rivera",
      currency: "USD",
      amount: "250.00",
      date: "2025-11-01",
      notes: "Split for conference tickets — half returned in December.",
      payments: [
        { id: "p0000001-0000-4000-8000-000000000001", amount: "100.00", date: "2025-12-05" },
        { id: "p0000002-0000-4000-8000-000000000002", amount: "50.00", date: "2026-01-02" },
      ],
      created_at: T0,
      updated_at: T1,
    },
    {
      id: "l0000002-0000-4000-8000-000000000002",
      direction: "borrowed",
      counterparty_name: "Studio North",
      currency: "USD",
      amount: "1800.00",
      date: "2025-09-15",
      notes: "Equipment deposit — due before renewal window.",
      payments: [{ id: "p0000003-0000-4000-8000-000000000003", amount: "600.00", date: "2025-11-20" }],
      created_at: T0,
      updated_at: T1,
    },
    {
      id: "l0000003-0000-4000-8000-000000000003",
      direction: "lent",
      counterparty_name: "Sam Okonkwo",
      currency: "EUR",
      amount: "45.00",
      date: "2026-01-05",
      payments: [],
      created_at: T1,
      updated_at: T1,
    },
  ],
};

const dates = {
  version: 1,
  last_google_sync_at: null,
  items: [
    {
      id: "d0000001-0000-4000-8000-000000000001",
      label: "Mara's birthday",
      type_id: "birthday",
      date: "1994-03-18",
      is_recurring: true,
      notes: "Send flowers by the 16th.",
      created_at: T0,
      updated_at: T1,
    },
    {
      id: "d0000002-0000-4000-8000-000000000002",
      label: "Lease renewal decision",
      type_id: "reminder",
      date: "2026-04-30",
      is_recurring: false,
      notes: "Compare two quotes before signing.",
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "d0000003-0000-4000-8000-000000000003",
      label: "Passport expires",
      type_id: "document_expiration",
      date: "2027-08-22",
      is_recurring: false,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "d0000004-0000-4000-8000-000000000004",
      label: "Anniversary dinner",
      type_id: "anniversary",
      date: "2019-06-02",
      is_recurring: true,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "d0000005-0000-4000-8000-000000000005",
      label: "Product launch dry run",
      type_id: "milestone",
      date: "2026-02-14",
      is_recurring: false,
      created_at: T1,
      updated_at: T1,
    },
  ],
};

const links = {
  version: 1,
  last_google_sync_at: null,
  items: [
    {
      id: "k0000001-0000-4000-8000-000000000001",
      url: "https://nextjs.org/docs",
      hostname: "nextjs.org",
      title: "Next.js Documentation",
      description: "App Router, caching, and deployment guides.",
      manual_tags: ["dev", "docs"],
      auto_tags: ["react"],
      reviewed: true,
      reviewed_at: "2026-01-08T09:00:00.000Z",
      review_due_date: "2026-07-01",
      status: "ready",
      created_at: T0,
      updated_at: T1,
    },
    {
      id: "k0000002-0000-4000-8000-000000000002",
      url: "https://tailwindcss.com/docs",
      hostname: "tailwindcss.com",
      title: "Tailwind CSS",
      description: "Utility-first CSS framework.",
      manual_tags: ["css", "design"],
      auto_tags: [],
      reviewed: false,
      review_due_date: "2026-03-15",
      status: "ready",
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "k0000003-0000-4000-8000-000000000003",
      url: "https://example.com/article/design-systems",
      hostname: "example.com",
      title: "Design systems at scale",
      manual_tags: ["design", "reading"],
      auto_tags: ["design"],
      reviewed: false,
      status: "ready",
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "k0000004-0000-4000-8000-000000000004",
      url: "https://github.com/tulu/no-sheet-kit",
      hostname: "github.com",
      title: "NoSheetKit on GitHub",
      manual_tags: ["opensource", "nsk"],
      auto_tags: [],
      reviewed: true,
      reviewed_at: T1,
      status: "ready",
      created_at: T0,
      updated_at: T1,
    },
  ],
};

const domains = {
  version: 1,
  last_google_sync_at: null,
  items: [
    {
      id: "m0000001-0000-4000-8000-000000000001",
      domain_name: "riverbend.tools",
      registrar: "Porkbun",
      purchased_at: "2023-04-12",
      expires_on: "2026-04-12",
      status_id: "active",
      auto_renew: true,
      price: "12.00",
      notes: "Wildcard DNS for staging.",
      created_at: T0,
      updated_at: T1,
    },
    {
      id: "m0000002-0000-4000-8000-000000000002",
      domain_name: "oldsideproject.dev",
      registrar: "Cloudflare",
      purchased_at: "",
      expires_on: "2026-06-01",
      status_id: "parked",
      auto_renew: false,
      price: "",
      notes: "Pointed to placeholder landing.",
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "m0000003-0000-4000-8000-000000000003",
      domain_name: "short.link",
      registrar: "Namecheap",
      purchased_at: "2021-01-20",
      expires_on: "2026-02-28",
      status_id: "for_sale",
      auto_renew: false,
      price: "499",
      created_at: T0,
      updated_at: T0,
    },
  ],
};

const tasks = {
  version: 1,
  last_google_sync_at: null,
  spaces: [
    {
      id: spaceWork,
      name: "Work",
      order: 0,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: spacePersonal,
      name: "Personal",
      order: 1,
      created_at: T0,
      updated_at: T0,
    },
  ],
  tasks: [
    {
      id: "t0000001-0000-4000-8000-000000000001",
      space_id: spaceWork,
      title: "Ship pricing table redesign",
      description: "Include annual vs monthly toggle and footnotes.",
      due_date: "2026-02-01",
      status: "in_progress",
      archived: false,
      order: 0,
      created_at: T0,
      updated_at: T1,
      comments: [
        {
          id: "c0000001-0000-4000-8000-000000000001",
          body: "Legal asked for a disclaimer under the CTA.",
          created_at: T0,
          updated_at: T0,
        },
      ],
    },
    {
      id: "t0000002-0000-4000-8000-000000000002",
      space_id: spaceWork,
      title: "Draft changelog for v0.2",
      due_date: "2026-01-18",
      status: "todo",
      archived: false,
      order: 1,
      created_at: T0,
      updated_at: T0,
      comments: [],
    },
    {
      id: "t0000003-0000-4000-8000-000000000003",
      space_id: spaceWork,
      title: "Migrate DNS for marketing site",
      status: "done",
      archived: false,
      order: 0,
      created_at: T0,
      updated_at: T1,
      comments: [],
    },
    {
      id: "t0000004-0000-4000-8000-000000000004",
      space_id: spacePersonal,
      title: "Book dentist cleaning",
      due_date: "2026-01-24",
      status: "todo",
      archived: false,
      order: 0,
      created_at: T0,
      updated_at: T0,
      comments: [],
    },
    {
      id: "t0000005-0000-4000-8000-000000000005",
      space_id: spacePersonal,
      title: "Weekly grocery run",
      status: "in_progress",
      archived: false,
      order: 1,
      created_at: T0,
      updated_at: T0,
      comments: [],
    },
  ],
};

const collections = {
  version: 1,
  last_google_sync_at: null,
  collections: [
    {
      id: colGames,
      name: "Board games",
      order: 0,
      show_price: true,
      show_link: true,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: colBooks,
      name: "Reading list",
      order: 1,
      show_price: false,
      show_link: false,
      created_at: T0,
      updated_at: T0,
    },
  ],
  items: [
    {
      id: "g0000001-0000-4000-8000-000000000001",
      collection_id: colGames,
      name: "Wingspan (2nd edition)",
      notes: "At home shelf — mint.",
      possession_status: "owned",
      price: 59.99,
      currency: "USD",
      link: "https://boardgamegeek.com/boardgame/266192/wingspan",
      order: 0,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "g0000002-0000-4000-8000-000000000002",
      collection_id: colGames,
      name: "Azul",
      possession_status: "lent_out",
      related_person: "Jamie",
      related_date: "2026-01-05",
      order: 1,
      created_at: T0,
      updated_at: T1,
    },
    {
      id: "g0000003-0000-4000-8000-000000000003",
      collection_id: colGames,
      name: "Spirit Island",
      possession_status: "wanted",
      notes: "Watch for holiday sale.",
      price: 89,
      currency: "USD",
      order: 2,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "b0000001-0000-4000-8000-000000000001",
      collection_id: colBooks,
      name: "Working in Public",
      possession_status: "owned",
      order: 0,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "b0000002-0000-4000-8000-000000000002",
      collection_id: colBooks,
      name: "The Design of Everyday Things",
      possession_status: "borrowed",
      related_person: "Public library",
      related_date: "2026-01-20",
      order: 1,
      created_at: T0,
      updated_at: T0,
    },
  ],
};

const tracker = {
  version: 1,
  last_google_sync_at: null,
  tracks: [
    {
      id: trackMaintenance,
      name: "Home upkeep",
      order: 0,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: trackOutings,
      name: "Outings",
      order: 1,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: trackSideProject,
      name: "Side project",
      order: 2,
      created_at: T0,
      updated_at: T0,
    },
    {
      id: trackReading,
      name: "Reading log",
      order: 3,
      created_at: T0,
      updated_at: T0,
    },
  ],
  entries: [
    {
      id: "r0000001-0000-4000-8000-000000000001",
      track_id: trackMaintenance,
      occurred_on: "2026-01-08",
      start_time: "09:00",
      end_time: "11:30",
      notes: "Deep clean and filter swap.",
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "r0000002-0000-4000-8000-000000000002",
      track_id: trackMaintenance,
      occurred_on: "2026-01-15",
      notes: "Quick tidy before guests.",
      created_at: T0,
      updated_at: T1,
    },
    {
      id: "r0000003-0000-4000-8000-000000000003",
      track_id: trackOutings,
      occurred_on: "2026-01-10",
      start_time: "14:00",
      end_time: "17:45",
      notes: "Museum and late lunch downtown.",
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "r0000004-0000-4000-8000-000000000004",
      track_id: trackOutings,
      occurred_on: "2026-01-10",
      start_time: "19:30",
      end_time: "21:00",
      notes: "Evening show (same day, second mark).",
      created_at: T1,
      updated_at: T1,
    },
    {
      id: "r0000005-0000-4000-8000-000000000005",
      track_id: trackOutings,
      occurred_on: "2026-01-18",
      created_at: T1,
      updated_at: T1,
    },
    {
      id: "r0000006-0000-4000-8000-000000000006",
      track_id: trackSideProject,
      occurred_on: "2026-01-11",
      start_time: "20:00",
      end_time: "22:15",
      notes: "Polished onboarding copy and fixed mobile nav.",
      created_at: T0,
      updated_at: T1,
    },
    {
      id: "r0000007-0000-4000-8000-000000000007",
      track_id: trackSideProject,
      occurred_on: "2026-01-17",
      notes: "Shipped v0.1.3 changelog draft.",
      created_at: T1,
      updated_at: T1,
    },
    {
      id: "r0000008-0000-4000-8000-000000000008",
      track_id: trackReading,
      occurred_on: "2026-01-09",
      start_time: "07:30",
      end_time: "08:10",
      notes: "Finished chapter 4 of Working in Public.",
      created_at: T0,
      updated_at: T0,
    },
    {
      id: "r0000009-0000-4000-8000-000000000009",
      track_id: trackReading,
      occurred_on: "2026-01-16",
      notes: "Skimmed design systems article from bookmarks.",
      created_at: T1,
      updated_at: T1,
    },
  ],
};

function pretty(obj) {
  return `${JSON.stringify(obj, null, 2)}\n`;
}

const zip = new JSZip();
zip.file("loans.json", pretty(loans));
zip.file("dates.json", pretty(dates));
zip.file("links.json", pretty(links));
zip.file("domains.json", pretty(domains));
zip.file("tasks.json", pretty(tasks));
zip.file("collections.json", pretty(collections));
zip.file("tracker.json", pretty(tracker));

const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, buf);
console.log(`Wrote ${path.relative(root, outFile)} (${buf.length} bytes)`);
