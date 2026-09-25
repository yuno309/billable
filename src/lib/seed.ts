import type {
  BusinessProfile,
  Client,
  Invoice,
  StoreState,
} from "@/lib/types";
import { toISODate } from "@/lib/format";

const iso = (offsetDays: number): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return toISODate(d);
};

const business: BusinessProfile = {
  name: "Alex Rivera",
  title: "Independent Product Designer",
  email: "alex@rivera.studio",
  phone: "(415) 555-0142",
  address: "218 Mission Street, Suite 4\nSan Francisco, CA 94105",
};

const clients: Client[] = [
  {
    id: "cl_northwind",
    name: "Northwind Labs",
    contactName: "Jordan Pierce",
    email: "jordan@northwindlabs.io",
    phone: "(206) 555-0118",
    address: "1201 Western Ave\nSeattle, WA 98101",
    notes: "Net 15. Prefers bank transfer. Sends PO numbers per project.",
    createdAt: iso(-310),
  },
  {
    id: "cl_lumen",
    name: "Lumen Health",
    contactName: "Priya Natarajan",
    email: "priya@lumenhealth.com",
    phone: "(312) 555-0193",
    address: "840 N Michigan Ave\nChicago, IL 60611",
    notes: "Net 30. Enterprise client — invoices must reference the contract ID.",
    createdAt: iso(-264),
  },
  {
    id: "cl_atlas",
    name: "Atlas Studio",
    contactName: "Marco Delgado",
    email: "marco@atlasstudio.co",
    phone: "(512) 555-0166",
    address: "1100 E 5th St\nAustin, TX 78702",
    notes: "Net 14. Fast payer, recurring design retainer.",
    createdAt: iso(-201),
  },
  {
    id: "cl_orbit",
    name: "Orbit Mobility",
    contactName: "Hana Kovács",
    email: "hana@orbitmobility.eu",
    phone: "+36 1 555 0139",
    address: "Kossuth Lajos utca 3\nBudapest, 1055",
    notes: "Net 30. International client — bills in USD.",
    createdAt: iso(-148),
  },
  {
    id: "cl_fern",
    name: "Fern & Field",
    contactName: "Talia Brooks",
    email: "talia@fernandfield.shop",
    phone: "(503) 555-0121",
    address: "2400 SE Hawthorne Blvd\nPortland, OR 97214",
    notes: "Net 21. Small team, milestone-based billing.",
    createdAt: iso(-96),
  },
  {
    id: "cl_quanta",
    name: "Quanta Robotics",
    contactName: "Dev Raman",
    email: "dev@quantarobotics.ai",
    phone: "(650) 555-0177",
    address: "3450 Hillview Ave\nPalo Alto, CA 94304",
    notes: "Net 30. New client as of this quarter.",
    createdAt: iso(-52),
  },
];

const item = (description: string, quantity: number, rate: number) => ({
  id: `it_${Math.random().toString(36).slice(2, 9)}`,
  description,
  quantity,
  rate,
});

const invoice = (
  number: string,
  clientId: string,
  issueOffset: number,
  dueOffset: number,
  status: Invoice["status"],
  taxRate: number,
  items: Invoice["items"],
  payments: Invoice["payments"] = [],
  notes?: string,
): Invoice => ({
  id: `inv_${Math.random().toString(36).slice(2, 10)}`,
  number,
  clientId,
  issueDate: iso(issueOffset),
  dueDate: iso(dueOffset),
  status,
  items,
  taxRate,
  payments,
  notes,
  createdAt: iso(issueOffset),
});

export const seedData = (): StoreState => {
  const invoices: Invoice[] = [
    // --- Northwind Labs ---
    invoice(
      "INV-1041",
      "cl_northwind",
      -82,
      -67,
      "paid",
      0,
      [
        item("Product design — onboarding flow (3 sprints)", 3, 4800),
        item("Design system audit", 1, 2200),
      ],
      [
        {
          id: "pay_1",
          amount: 16600,
          date: iso(-70),
          method: "bank_transfer",
          note: "Wire for INV-1041",
        },
      ],
    ),
    invoice(
      "INV-1062",
      "cl_northwind",
      -38,
      -23,
      "paid",
      0,
      [item("UI retainer — November", 1, 5400)],
      [
        {
          id: "pay_2",
          amount: 5400,
          date: iso(-24),
          method: "bank_transfer",
        },
      ],
    ),
    invoice(
      "INV-1074",
      "cl_northwind",
      -9,
      6,
      "sent",
      0,
      [
        item("Dashboard redesign — discovery", 1, 3600),
        item("Prototype & usability testing", 2, 1450),
      ],
    ),

    // --- Lumen Health ---
    invoice(
      "INV-1036",
      "cl_lumen",
      -120,
      -90,
      "paid",
      8,
      [
        item("Patient portal — UX research", 1, 9800),
        item("Accessibility remediation", 1, 4200),
      ],
      [
        {
          id: "pay_3",
          amount: 15120,
          date: iso(-91),
          method: "bank_transfer",
        },
      ],
    ),
    invoice(
      "INV-1055",
      "cl_lumen",
      -55,
      -25,
      "paid",
      8,
      [item("Design system rollout — phase 1", 1, 12400)],
      [
        {
          id: "pay_4",
          amount: 8000,
          date: iso(-26),
          method: "bank_transfer",
          note: "First installment",
        },
        {
          id: "pay_5",
          amount: 5392,
          date: iso(-20),
          method: "bank_transfer",
          note: "Final installment",
        },
      ],
    ),
    invoice(
      "INV-1069",
      "cl_lumen",
      -21,
      9,
      "sent",
      8,
      [
        item("Clinician console — interaction design", 1, 8600),
        item("Component library documentation", 1, 1800),
      ],
    ),

    // --- Atlas Studio ---
    invoice(
      "INV-1049",
      "cl_atlas",
      -64,
      -50,
      "paid",
      0,
      [item("Brand refresh — logo & marks", 1, 6200)],
      [
        {
          id: "pay_6",
          amount: 6200,
          date: iso(-48),
          method: "stripe",
        },
      ],
    ),
    invoice(
      "INV-1067",
      "cl_atlas",
      -17,
      -3,
      "sent",
      0,
      [
        item("Marketing site — design retainer", 1, 4200),
        item("Illustration set (6)", 6, 320),
      ],
    ),

    // --- Orbit Mobility ---
    invoice(
      "INV-1058",
      "cl_orbit",
      -46,
      -16,
      "paid",
      0,
      [item("Mobile app — navigation & flows", 1, 7400)],
      [
        {
          id: "pay_7",
          amount: 7400,
          date: iso(-15),
          method: "paypal",
        },
      ],
    ),
    invoice(
      "INV-1071",
      "cl_orbit",
      -13,
      17,
      "sent",
      0,
      [
        item("Localization audit (EN/HU)", 1, 2600),
        item("Design QA cycle", 2, 950),
      ],
    ),

    // --- Fern & Field ---
    invoice(
      "INV-1064",
      "cl_fern",
      -29,
      -8,
      "sent",
      0,
      [
        item("Shopify theme — homepage", 1, 3400),
        item("Product page variants (3)", 3, 560),
      ],
    ),
    invoice(
      "INV-1075",
      "cl_fern",
      -4,
      17,
      "draft",
      0,
      [item("Email template suite", 1, 1900)],
    ),

    // --- Quanta Robotics ---
    invoice(
      "INV-1070",
      "cl_quanta",
      -15,
      15,
      "sent",
      0,
      [
        item("Control panel — information architecture", 1, 5800),
        item("Stakeholder workshop", 1, 1500),
      ],
    ),
    invoice(
      "INV-1076",
      "cl_quanta",
      -2,
      28,
      "draft",
      0,
      [item("Robot telemetry dashboard — concepts", 1, 4400)],
    ),
  ];

  return { clients, invoices, business };
};
