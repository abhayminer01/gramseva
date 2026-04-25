const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  Footer,
  Header,
  ImageRun,
  TableOfContents,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ── Color Palette ──────────────────────────────────────────────
const COLORS = {
  primary: "1B4F72",       // Deep blue
  primaryLight: "D6EAF8",  // Soft blue
  accent: "2E86C1",        // Medium blue
  headerBg: "1B4F72",      // Table header background
  headerText: "FFFFFF",    // White text on header
  altRowBg: "EBF5FB",      // Alternating row background
  border: "AED6F1",        // Subtle border color
  darkText: "1C2833",      // Main text
  grayText: "5D6D7E",      // Secondary text
  success: "27AE60",       // Green for required
  warning: "E67E22",       // Orange for defaults
};

// ── Table definitions from Mongoose models ─────────────────────
const tables = [
  {
    name: "Citizens",
    collection: "citizens",
    description:
      "Stores registered citizen profiles with approval workflow. Citizens must be verified by a ward member or secretary before gaining full access to the platform.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "name", type: "String", required: true, description: "Full name of the citizen" },
      { name: "phone", type: "String", required: true, unique: true, description: "Mobile number (unique, used for login)" },
      { name: "password", type: "String", required: true, description: "Hashed password for authentication" },
      { name: "role", type: "String", required: false, default: "'citizen'", description: "User role identifier" },
      { name: "rationCardNumber", type: "String", required: false, description: "Government ration card number for identity verification" },
      { name: "district", type: "String", required: true, description: "District the citizen belongs to" },
      { name: "localBodyType", type: "String (Enum)", required: true, enum: "Panchayat | Municipality | Corporation", description: "Type of local governing body" },
      { name: "localBodyName", type: "String", required: true, description: "Name of the local body (e.g., 'Thrissur Municipality')" },
      { name: "wardNumber", type: "String", required: false, description: "Ward number within the local body" },
      { name: "isApproved", type: "Boolean", required: false, default: "false", description: "Whether the citizen's registration is approved" },
      { name: "isRejected", type: "Boolean", required: false, default: "false", description: "Whether the citizen's registration is rejected" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp of account creation" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last profile update" },
    ],
  },
  {
    name: "Authorities",
    collection: "authorities",
    description:
      "Stores government authority profiles including ward members, secretaries, higher authorities, and system administrators. Authorities manage citizen approvals, grievance resolution, and MGNREGA workflows.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "name", type: "String", required: true, description: "Full name of the authority" },
      { name: "phone", type: "String", required: true, unique: true, description: "Mobile number (unique, used for login)" },
      { name: "password", type: "String", required: true, description: "Hashed password for authentication" },
      { name: "role", type: "String (Enum)", required: true, enum: "ward_member | secretary | higher_authority | admin", description: "Hierarchical role of the authority" },
      { name: "district", type: "String", required: true, description: "District jurisdiction of the authority" },
      { name: "localBodyType", type: "String (Enum)", required: true, enum: "Panchayat | Municipality | Corporation | System", description: "Type of local governing body" },
      { name: "localBodyName", type: "String", required: true, description: "Name of the local body they oversee" },
      { name: "wardNumber", type: "String", required: false, description: "Specific ward assigned (for ward members)" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp of account creation" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last profile update" },
    ],
  },
  {
    name: "Grievances",
    collection: "grievances",
    description:
      "Central table for citizen-submitted grievances/complaints. Supports a full lifecycle — from submission through review, escalation, and resolution — with priority levels and upvoting.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "title", type: "String", required: true, description: "Short title describing the grievance" },
      { name: "description", type: "String", required: true, description: "Detailed description of the issue" },
      { name: "images", type: "Array [String]", required: false, description: "URLs of uploaded supporting images" },
      { name: "category", type: "String (Enum)", required: true, enum: "water | road | electricity | waste | other", description: "Classification category for the grievance" },
      { name: "createdBy", type: "ObjectId → Citizen", required: true, description: "Reference to the citizen who filed the grievance (FK)" },
      { name: "district", type: "String", required: true, description: "District where the issue is located" },
      { name: "localBody", type: "String", required: true, description: "Local body name where the issue is located" },
      { name: "ward", type: "String", required: false, description: "Ward number where the issue is located" },
      { name: "status", type: "String (Enum)", required: false, default: "'pending'", enum: "pending | accepted | rejected | in_progress | resolved | escalated", description: "Current lifecycle status of the grievance" },
      { name: "priority", type: "String (Enum)", required: false, default: "'low'", enum: "low | medium | high", description: "Priority level assigned by authority" },
      { name: "upvotes", type: "Array [ObjectId → Citizen]", required: false, description: "List of citizens who upvoted this grievance" },
      { name: "deadline", type: "Date", required: false, description: "Target resolution deadline" },
      { name: "escalatedToHigher", type: "Boolean", required: false, default: "false", description: "Whether grievance has been escalated to higher authority" },
      { name: "actionReason", type: "String", required: false, description: "Reason provided by authority for accept/reject/resolve action" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp when grievance was filed" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last status change" },
    ],
  },
  {
    name: "Comments",
    collection: "comments",
    description:
      "Stores citizen comments on grievances, enabling community discussion and additional context for each issue.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "grievanceId", type: "ObjectId → Grievance", required: true, description: "Reference to the parent grievance (FK)" },
      { name: "userId", type: "ObjectId → Citizen", required: true, description: "Reference to the citizen who posted the comment (FK)" },
      { name: "message", type: "String", required: true, description: "Comment text content" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp of comment creation" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last edit" },
    ],
  },
  {
    name: "Announcements",
    collection: "announcements",
    description:
      "Stores announcements and notifications published by authorities to citizens within their local body jurisdiction.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "title", type: "String", required: true, description: "Heading of the announcement" },
      { name: "content", type: "String", required: true, description: "Full body text of the announcement" },
      { name: "type", type: "String (Enum)", required: false, default: "'announcement'", enum: "announcement | notification", description: "Type classification of the post" },
      { name: "createdBy", type: "ObjectId → User", required: true, description: "Reference to the authority who created the post (FK)" },
      { name: "localBody", type: "String", required: true, description: "Local body this announcement targets" },
      { name: "targetAudience", type: "String", required: false, default: "'all'", description: "Target scope — 'all' or a specific ward number" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp of announcement creation" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last update" },
    ],
  },
  {
    name: "MGNREGA Requests",
    collection: "mgnregarequests",
    description:
      "Stores citizen requests for MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) work projects. Follows an approval pipeline from ward member review to secretary/higher authority approval.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "citizenId", type: "ObjectId → Citizen", required: true, description: "Reference to the requesting citizen (FK)" },
      { name: "title", type: "String", required: true, description: "Title/description of the requested MGNREGA work" },
      { name: "location", type: "String", required: true, description: "Location where the work is requested" },
      { name: "images", type: "Array [String]", required: false, description: "URLs of uploaded images showing the site" },
      { name: "district", type: "String", required: true, description: "District of the request" },
      { name: "localBodyType", type: "String", required: true, description: "Type of local body (Panchayat / Municipality / Corporation)" },
      { name: "localBodyName", type: "String", required: true, description: "Name of the local body" },
      { name: "wardNumber", type: "String", required: false, description: "Ward number where the work is requested" },
      { name: "status", type: "String (Enum)", required: false, default: "'pending'", enum: "pending | forwarded | approved | rejected", description: "Current approval status in the pipeline" },
      { name: "reviewedBy", type: "ObjectId → Authority", required: false, description: "Reference to the authority who reviewed the request (FK)" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp of request submission" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last status change" },
    ],
  },
  {
    name: "Escalation Logs",
    collection: "escalationlogs",
    description:
      "Tracks every auto-escalation event triggered when a grievance receives no response within the configured time window (default: 10 days). Records which authority level the grievance was escalated from and to, enabling full accountability and audit trails for the escalation pipeline.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "grievanceId", type: "ObjectId → Grievance", required: true, description: "Reference to the escalated grievance (FK)" },
      { name: "escalatedFrom", type: "String (Enum)", required: true, enum: "ward_member | secretary", description: "Authority level the grievance was escalated FROM" },
      { name: "escalatedTo", type: "String (Enum)", required: true, enum: "secretary | higher_authority", description: "Authority level the grievance was escalated TO" },
      { name: "escalationType", type: "String (Enum)", required: true, default: "'auto'", enum: "auto | manual", description: "Whether escalation was triggered automatically (10-day timeout) or manually by an authority" },
      { name: "reason", type: "String", required: true, description: "Reason for escalation (e.g., 'No response within 10 days', or manual reason)" },
      { name: "escalatedAt", type: "Date", required: true, default: "Date.now", description: "Exact timestamp when the escalation occurred" },
      { name: "previousStatus", type: "String", required: true, description: "Status of the grievance before escalation" },
      { name: "newStatus", type: "String", required: true, default: "'escalated'", description: "Status of the grievance after escalation" },
      { name: "daysWithoutResponse", type: "Number", required: false, description: "Number of days the grievance went without a response before escalation" },
      { name: "escalatedBySystem", type: "Boolean", required: false, default: "true", description: "Flag indicating if escalation was done by the automated cron job" },
      { name: "notifiedAuthorities", type: "Array [ObjectId → Authority]", required: false, description: "List of higher authorities notified about this escalation" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp of log creation" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last update" },
    ],
  },
  {
    name: "Notifications",
    collection: "notifications",
    description:
      "Stores in-app notifications sent to citizens and authorities. Covers grievance status updates, escalation alerts, MGNREGA request updates, approval notifications, and system announcements. Supports read/unread tracking.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "recipientId", type: "ObjectId", required: true, description: "Reference to the user receiving the notification (Citizen or Authority)" },
      { name: "recipientModel", type: "String (Enum)", required: true, enum: "Citizen | Authority", description: "Discriminator indicating whether recipient is a Citizen or Authority" },
      { name: "type", type: "String (Enum)", required: true, enum: "grievance_update | escalation_alert | mgnrega_update | approval_status | announcement | system", description: "Category of the notification" },
      { name: "title", type: "String", required: true, description: "Short notification heading" },
      { name: "message", type: "String", required: true, description: "Detailed notification body text" },
      { name: "referenceId", type: "ObjectId", required: false, description: "Reference to the related document (grievance, request, etc.)" },
      { name: "referenceModel", type: "String (Enum)", required: false, enum: "Grievance | MgnregaRequest | Announcement", description: "Collection name of the referenced document" },
      { name: "isRead", type: "Boolean", required: false, default: "false", description: "Whether the notification has been read by the recipient" },
      { name: "readAt", type: "Date", required: false, description: "Timestamp when the notification was marked as read" },
      { name: "priority", type: "String (Enum)", required: false, default: "'normal'", enum: "low | normal | high | urgent", description: "Priority level — urgent used for escalation alerts" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp of notification creation" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last update" },
    ],
  },
  {
    name: "Grievance Status History",
    collection: "grievancestatushistories",
    description:
      "Audit trail recording every status transition of a grievance throughout its lifecycle. Used for transparency reporting, SLA monitoring, and calculating response times for the auto-escalation engine.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "grievanceId", type: "ObjectId → Grievance", required: true, description: "Reference to the grievance being tracked (FK)" },
      { name: "fromStatus", type: "String (Enum)", required: true, enum: "pending | accepted | rejected | in_progress | resolved | escalated", description: "Previous status before transition" },
      { name: "toStatus", type: "String (Enum)", required: true, enum: "pending | accepted | rejected | in_progress | resolved | escalated", description: "New status after transition" },
      { name: "changedBy", type: "ObjectId", required: false, description: "Reference to the authority or system that triggered the change" },
      { name: "changedByModel", type: "String (Enum)", required: false, enum: "Authority | System", description: "Discriminator — 'System' for auto-escalation, 'Authority' for manual" },
      { name: "reason", type: "String", required: false, description: "Reason or note for the status change" },
      { name: "transitionDuration", type: "Number", required: false, description: "Time in hours spent in the previous status before this transition" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp when this transition occurred" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last update" },
    ],
  },
  {
    name: "Scheduled Jobs",
    collection: "scheduledjobs",
    description:
      "Configuration and execution log for automated background jobs (cron tasks). The primary job is the grievance auto-escalation checker that runs daily to identify unresponded grievances exceeding the 10-day SLA threshold and triggers escalation.",
    fields: [
      { name: "_id", type: "ObjectId", required: true, description: "Auto-generated unique identifier (Primary Key)" },
      { name: "jobName", type: "String", required: true, unique: true, description: "Unique name identifier for the job (e.g., 'grievance_auto_escalation')" },
      { name: "jobType", type: "String (Enum)", required: true, enum: "escalation_check | cleanup | report_generation | notification_digest", description: "Category of the scheduled job" },
      { name: "cronExpression", type: "String", required: true, description: "Cron schedule expression (e.g., '0 0 * * *' for daily at midnight)" },
      { name: "isActive", type: "Boolean", required: false, default: "true", description: "Whether the job is currently enabled" },
      { name: "lastRunAt", type: "Date", required: false, description: "Timestamp of the most recent execution" },
      { name: "lastRunStatus", type: "String (Enum)", required: false, enum: "success | failed | partial", description: "Result of the last execution" },
      { name: "lastRunResult", type: "Object", required: false, description: "JSON object with details of last run (e.g., { escalated: 5, errors: 0 })" },
      { name: "nextRunAt", type: "Date", required: false, description: "Scheduled timestamp for the next execution" },
      { name: "escalationThresholdDays", type: "Number", required: false, default: "10", description: "Number of days without response before auto-escalation (configurable)" },
      { name: "totalRunCount", type: "Number", required: false, default: "0", description: "Total number of times this job has been executed" },
      { name: "createdAt", type: "Date", required: false, default: "auto", description: "Timestamp of job creation" },
      { name: "updatedAt", type: "Date", required: false, default: "auto", description: "Timestamp of last update" },
    ],
  },
];

// ── Helper: Create a styled table cell ─────────────────────────
function createCell(text, options = {}) {
  const {
    bold = false,
    isHeader = false,
    width = undefined,
    alignment = AlignmentType.LEFT,
    fontSize = 20,
    color = COLORS.darkText,
    columnSpan = 1,
  } = options;

  return new TableCell({
    columnSpan,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: isHeader
      ? { type: ShadingType.SOLID, fill: COLORS.headerBg, color: COLORS.headerBg }
      : undefined,
    margins: {
      top: 60,
      bottom: 60,
      left: 100,
      right: 100,
    },
    children: [
      new Paragraph({
        alignment,
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: text,
            bold: bold || isHeader,
            size: fontSize,
            color: isHeader ? COLORS.headerText : color,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

// ── Helper: Create a table header row ──────────────────────────
function createHeaderRow() {
  return new TableRow({
    tableHeader: true,
    children: [
      createCell("Field Name", { isHeader: true, width: 18 }),
      createCell("Data Type", { isHeader: true, width: 16 }),
      createCell("Required", { isHeader: true, width: 10, alignment: AlignmentType.CENTER }),
      createCell("Default", { isHeader: true, width: 12, alignment: AlignmentType.CENTER }),
      createCell("Constraints / Enum Values", { isHeader: true, width: 18 }),
      createCell("Description", { isHeader: true, width: 26 }),
    ],
  });
}

// ── Helper: Create a data row ──────────────────────────────────
function createDataRow(field, index) {
  const isAlt = index % 2 === 1;

  const cells = [
    // Field name
    new TableCell({
      width: { size: 18, type: WidthType.PERCENTAGE },
      shading: isAlt ? { type: ShadingType.SOLID, fill: COLORS.altRowBg, color: COLORS.altRowBg } : undefined,
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      children: [
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({ text: field.name, bold: true, size: 19, color: COLORS.primary, font: "Consolas" }),
          ],
        }),
      ],
    }),
    // Type
    new TableCell({
      width: { size: 16, type: WidthType.PERCENTAGE },
      shading: isAlt ? { type: ShadingType.SOLID, fill: COLORS.altRowBg, color: COLORS.altRowBg } : undefined,
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      children: [
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({ text: field.type, size: 19, color: COLORS.accent, font: "Consolas" }),
          ],
        }),
      ],
    }),
    // Required
    new TableCell({
      width: { size: 10, type: WidthType.PERCENTAGE },
      shading: isAlt ? { type: ShadingType.SOLID, fill: COLORS.altRowBg, color: COLORS.altRowBg } : undefined,
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
          children: [
            new TextRun({
              text: field.required ? "✔ Yes" : "No",
              size: 19,
              bold: field.required,
              color: field.required ? COLORS.success : COLORS.grayText,
              font: "Calibri",
            }),
          ],
        }),
      ],
    }),
    // Default
    new TableCell({
      width: { size: 12, type: WidthType.PERCENTAGE },
      shading: isAlt ? { type: ShadingType.SOLID, fill: COLORS.altRowBg, color: COLORS.altRowBg } : undefined,
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
          children: [
            new TextRun({
              text: field.default || "—",
              size: 19,
              color: field.default ? COLORS.warning : COLORS.grayText,
              font: "Consolas",
            }),
          ],
        }),
      ],
    }),
    // Constraints
    new TableCell({
      width: { size: 18, type: WidthType.PERCENTAGE },
      shading: isAlt ? { type: ShadingType.SOLID, fill: COLORS.altRowBg, color: COLORS.altRowBg } : undefined,
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      children: [
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({
              text: field.unique ? "Unique; " : "",
              size: 18,
              bold: true,
              color: COLORS.darkText,
              font: "Calibri",
            }),
            new TextRun({
              text: field.enum || "—",
              size: 18,
              color: field.enum ? COLORS.accent : COLORS.grayText,
              font: field.enum ? "Consolas" : "Calibri",
            }),
          ],
        }),
      ],
    }),
    // Description
    new TableCell({
      width: { size: 26, type: WidthType.PERCENTAGE },
      shading: isAlt ? { type: ShadingType.SOLID, fill: COLORS.altRowBg, color: COLORS.altRowBg } : undefined,
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      children: [
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({ text: field.description, size: 19, color: COLORS.darkText, font: "Calibri" }),
          ],
        }),
      ],
    }),
  ];

  return new TableRow({ children: cells });
}

// ── Build the document ─────────────────────────────────────────
async function generateDocument() {
  const sections = [];

  // ── Title Page Section ──
  sections.push({
    properties: {
      page: {
        margin: { top: 1440, bottom: 1440, left: 1080, right: 1080 },
      },
    },
    children: [
      new Paragraph({ spacing: { after: 1200 } }),
      new Paragraph({ spacing: { after: 1200 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "GramSeva",
            bold: true,
            size: 72,
            color: COLORS.primary,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: "Digital Governance Platform",
            size: 36,
            color: COLORS.accent,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [
          new TextRun({
            text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            size: 28,
            color: COLORS.border,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "Database Schema Documentation",
            bold: true,
            size: 44,
            color: COLORS.darkText,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
        children: [
          new TextRun({
            text: "MongoDB / Mongoose ODM",
            size: 28,
            color: COLORS.grayText,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `Generated on: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
            size: 22,
            color: COLORS.grayText,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `Total Tables: ${tables.length}  |  Database: MongoDB (NoSQL)`,
            size: 22,
            color: COLORS.grayText,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });

  // ── Overview Section ──
  const overviewChildren = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: "1. Database Overview", bold: true, size: 36, color: COLORS.primary, font: "Calibri" }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "GramSeva uses MongoDB as its primary database with Mongoose ODM for schema enforcement. The database follows a document-oriented design with referential integrity maintained via ObjectId references between collections. Below is a summary of all collections:",
          size: 22,
          color: COLORS.darkText,
          font: "Calibri",
        }),
      ],
    }),
  ];

  // Summary table
  const summaryHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      createCell("#", { isHeader: true, width: 8, alignment: AlignmentType.CENTER }),
      createCell("Collection Name", { isHeader: true, width: 25 }),
      createCell("MongoDB Collection", { isHeader: true, width: 25 }),
      createCell("Total Fields", { isHeader: true, width: 15, alignment: AlignmentType.CENTER }),
      createCell("Description", { isHeader: true, width: 27 }),
    ],
  });

  const summaryRows = tables.map((table, i) =>
    new TableRow({
      children: [
        createCell(`${i + 1}`, { width: 8, alignment: AlignmentType.CENTER, bold: true }),
        createCell(table.name, { width: 25, bold: true, color: COLORS.primary }),
        createCell(table.collection, { width: 25, color: COLORS.accent }),
        createCell(`${table.fields.length}`, { width: 15, alignment: AlignmentType.CENTER }),
        createCell(table.description.substring(0, 80) + "...", { width: 27, fontSize: 18 }),
      ],
    })
  );

  overviewChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [summaryHeaderRow, ...summaryRows],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      },
    })
  );

  sections.push({
    properties: {
      page: {
        margin: { top: 1080, bottom: 1080, left: 900, right: 900 },
        size: { orientation: "landscape" },
      },
    },
    children: overviewChildren,
  });

  // ── Individual Table Sections ──
  tables.forEach((table, tableIndex) => {
    const children = [];

    // Section heading
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: `${tableIndex + 2}. ${table.name}`,
            bold: true,
            size: 36,
            color: COLORS.primary,
            font: "Calibri",
          }),
        ],
      })
    );

    // Collection name badge
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Collection: ", size: 22, color: COLORS.grayText, font: "Calibri" }),
          new TextRun({
            text: table.collection,
            bold: true,
            size: 22,
            color: COLORS.accent,
            font: "Consolas",
          }),
          new TextRun({ text: "   |   ", size: 22, color: COLORS.grayText, font: "Calibri" }),
          new TextRun({ text: "Fields: ", size: 22, color: COLORS.grayText, font: "Calibri" }),
          new TextRun({
            text: `${table.fields.length}`,
            bold: true,
            size: 22,
            color: COLORS.primary,
            font: "Calibri",
          }),
        ],
      })
    );

    // Description
    children.push(
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({ text: table.description, size: 21, color: COLORS.darkText, font: "Calibri" }),
        ],
      })
    );

    // Field table
    const headerRow = createHeaderRow();
    const dataRows = table.fields.map((field, i) => createDataRow(field, i));

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
          left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
          right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        },
      })
    );

    // Relationships note
    const refs = table.fields.filter((f) => f.type.includes("→"));
    if (refs.length > 0) {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 50 },
          children: [
            new TextRun({ text: "Relationships:", bold: true, size: 22, color: COLORS.primary, font: "Calibri" }),
          ],
        })
      );
      refs.forEach((ref) => {
        const target = ref.type.split("→")[1].trim();
        children.push(
          new Paragraph({
            spacing: { after: 30 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: "● ", size: 20, color: COLORS.accent, font: "Calibri" }),
              new TextRun({ text: `${ref.name}`, bold: true, size: 20, color: COLORS.primary, font: "Consolas" }),
              new TextRun({ text: ` → references `, size: 20, color: COLORS.darkText, font: "Calibri" }),
              new TextRun({ text: target, bold: true, size: 20, color: COLORS.accent, font: "Consolas" }),
              new TextRun({ text: ` collection`, size: 20, color: COLORS.darkText, font: "Calibri" }),
            ],
          })
        );
      });
    }

    sections.push({
      properties: {
        page: {
          margin: { top: 1080, bottom: 1080, left: 900, right: 900 },
          size: { orientation: "landscape" },
        },
      },
      children,
    });
  });

  // ── ER Relationships Section ──
  const erChildren = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: `${tables.length + 2}. Entity Relationships`, bold: true, size: 36, color: COLORS.primary, font: "Calibri" }),
      ],
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "The following diagram summarizes all foreign key relationships between collections in the GramSeva database:",
          size: 22,
          color: COLORS.darkText,
          font: "Calibri",
        }),
      ],
    }),
  ];

  const relationships = [
    { from: "Grievance.createdBy", to: "Citizen._id", label: "A citizen creates grievances" },
    { from: "Grievance.upvotes[]", to: "Citizen._id", label: "Citizens can upvote grievances" },
    { from: "Comment.grievanceId", to: "Grievance._id", label: "Comments belong to a grievance" },
    { from: "Comment.userId", to: "Citizen._id", label: "A citizen posts comments" },
    { from: "Announcement.createdBy", to: "Authority._id", label: "An authority creates announcements" },
    { from: "MgnregaRequest.citizenId", to: "Citizen._id", label: "A citizen submits MGNREGA requests" },
    { from: "MgnregaRequest.reviewedBy", to: "Authority._id", label: "An authority reviews MGNREGA requests" },
    { from: "EscalationLog.grievanceId", to: "Grievance._id", label: "Escalation log tracks which grievance was auto-escalated" },
    { from: "EscalationLog.notifiedAuthorities[]", to: "Authority._id", label: "Higher authorities notified on escalation" },
    { from: "Notification.recipientId", to: "Citizen / Authority._id", label: "Notification delivered to a citizen or authority (polymorphic)" },
    { from: "Notification.referenceId", to: "Grievance / MgnregaRequest._id", label: "Notification references a grievance or request (polymorphic)" },
    { from: "GrievanceStatusHistory.grievanceId", to: "Grievance._id", label: "Status history tracks transitions for a grievance" },
    { from: "GrievanceStatusHistory.changedBy", to: "Authority._id", label: "Authority or system that triggered the status change" },
  ];

  const relHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      createCell("#", { isHeader: true, width: 5, alignment: AlignmentType.CENTER }),
      createCell("Source Field", { isHeader: true, width: 25 }),
      createCell("→", { isHeader: true, width: 5, alignment: AlignmentType.CENTER }),
      createCell("Target Field", { isHeader: true, width: 25 }),
      createCell("Description", { isHeader: true, width: 40 }),
    ],
  });

  const relRows = relationships.map((rel, i) =>
    new TableRow({
      children: [
        createCell(`${i + 1}`, { width: 5, alignment: AlignmentType.CENTER }),
        createCell(rel.from, { width: 25, bold: true, color: COLORS.primary }),
        createCell("→", { width: 5, alignment: AlignmentType.CENTER, color: COLORS.accent }),
        createCell(rel.to, { width: 25, bold: true, color: COLORS.accent }),
        createCell(rel.label, { width: 40 }),
      ],
    })
  );

  erChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [relHeaderRow, ...relRows],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      },
    })
  );

  sections.push({
    properties: {
      page: {
        margin: { top: 1080, bottom: 1080, left: 900, right: 900 },
        size: { orientation: "landscape" },
      },
    },
    children: erChildren,
  });

  // ── Create Document ──
  const doc = new Document({
    creator: "GramSeva Development Team",
    title: "GramSeva - Database Schema Documentation",
    description: "Complete database table documentation for the GramSeva Digital Governance Platform",
    sections,
  });

  // ── Write to file ──
  const outputPath = path.join(__dirname, "..", "..", "GramSeva_Database_Tables.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Document generated successfully!`);
  console.log(`📄 File: ${outputPath}`);
  console.log(`📊 Tables documented: ${tables.length}`);
  console.log(`📐 Total fields: ${tables.reduce((sum, t) => sum + t.fields.length, 0)}`);
}

generateDocument().catch(console.error);
