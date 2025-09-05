// tina/config.ts
import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

/** Base subpath (no leading/trailing slash), e.g. "Docusaurus-docs" or "" */
const baseSubpath = (process.env.DOCS_BASEURL || "/Docusaurus-docs")
  .replace(/^\/|\/$/g, "");

/** Small helpers for slide block generation */
const defaults = { top: "8%", left: "7.5%", width: "85%", height: "84%" };
const trim = (s?: string) => (s ?? "").trim();
const esc = (s: string) =>
  s.replace(/\n+/g, " ").replace(/\|/g, "\\|").replace(/"/g, '\\"');
const normalizeImage = (p?: string) => {
  if (!p) return "";
  // Tina returns paths relative to "static" with our media settings.
  // Normalize to site URL paths like "/img/foo.png".
  const cleaned = p.replace(/^static\//, "").replace(/^public\//, "");
  return "/" + cleaned.replace(/^\/+/, "");
};
const mdHeading = (lvl: "h2" | "h3", title?: string) =>
  title ? (lvl === "h2" ? `## ${trim(title)}` : `### ${trim(title)}`) : "";

/** Build one slide’s markdown block */
function makeSlide(params: {
  variant: "phoneFrame" | "screenshotBox";
  titleLevel: "h2" | "h3";
  title?: string;
  text?: string;
  image?: string;
  caption?: string;
  top?: string;
  left?: string;
  width?: string;
  height?: string;
}) {
  const {
    variant,
    titleLevel,
    title,
    text,
    image,
    caption,
    top,
    left,
    width,
    height,
  } = params;

  const heading = mdHeading(titleLevel, title);
  const screenshot = normalizeImage(image);
  const cap = esc(caption || title || "");
  const block = `@[${variant}](
  screenshot="${esc(screenshot)}",
  alt="${cap}",
  top="${trim(top) || defaults.top}",
  left="${trim(left) || defaults.left}",
  width="${trim(width) || defaults.width}",
  height="${trim(height) || defaults.height}",
  caption="${cap}"
)`;

  const body = text ? `\n${trim(text)}\n` : "\n";
  return `\n---\n${heading}${heading ? "\n" : ""}${block}${body}`;
}

/** DRY fields for sidebars */
function sidebarItemFields() {
  return [
    {
      type: "string",
      name: "type",
      label: "Type",
      options: [
        { value: "doc", label: "Document" },
        { value: "category", label: "Category" },
      ],
      required: true,
    },
    {
      type: "string",
      name: "id",
      label: "Document ID",
      description: "Path to document (e.g., android/deployapp/home)",
      required: false,
    },
    { type: "string", name: "label", label: "Display Label", required: true },
    {
      type: "boolean",
      name: "collapsed",
      label: "Collapsed by default",
      description: "Only for categories",
    },
    {
      type: "object",
      name: "items",
      label: "Sub-items",
      list: true,
      description: "Only for categories",
      fields: [
        {
          type: "string",
          name: "type",
          label: "Type",
          options: [
            { value: "doc", label: "Document" },
            { value: "category", label: "Category" },
          ],
        },
        { type: "string", name: "id", label: "Document ID" },
        { type: "string", name: "label", label: "Display Label" },
      ],
    },
  ];
}

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID!,
  token: process.env.TINA_TOKEN!,

  // Build Tina admin under static/admin, and serve from <baseUrl>/admin
  build: {
    outputFolder: "admin",
    publicFolder: "static",
    basePath: baseSubpath, // do NOT include "/admin"
  },

  // Drag & drop uploads → static/img/** → site URL /img/**
  media: {
    tina: {
      mediaRoot: "img",
      publicFolder: "static",
    },
  },

  schema: {
    collections: [
      /**
       * Regular Docs — edit files under docs/**.md
       */
      {
        name: "docs",
        label: "Docs",
        path: "docs",
        format: "md",
        match: { include: "**/*.md" },
        fields: [
          { type: "string", name: "title", label: "Title" },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
            ui: {
              toolbar: [
                "heading1",
                "heading2",
                "heading3",
                "|",
                "bold",
                "italic",
                "link",
                "ul",
                "ol",
                "quote",
                "code",
                "hr",
                "undo",
                "redo",
              ],
            },
          },
        ],
      },

      /**
       * Slide Decks — authors press "Add Slide", pick variant, image, etc.
       * We inject the exact markdown your Reveal builder expects.
       */
      {
        name: "decks",
        label: "Slide Decks",
        path: "src/decks",
        format: "md",
        ui: {
          allowedActions: { delete: true },
          filename: {
            slugify: (values: { title?: string }) =>
              (values?.title || "untitled-deck")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
          },
        },
        fields: [
          { type: "string", name: "title", label: "Deck title" },
          {
            type: "string",
            name: "deckPath",
            label: "Output path",
            required: true,
            description: "Used by your build/export script.",
          },

          // Writers work in this ONE body field; toolbar handles slide insertion.
          {
            type: "rich-text",
            name: "body",
            label: "Slides",
            isBody: true,
            ui: {
              toolbar: [
                "heading2",
                "heading3",
                "|",
                "bold",
                "italic",
                "link",
                "ul",
                "ol",
                "hr",
                "|",
                {
                  name: "Add Slide",
                  icon: "➕",
                  action: async ({ editor, popup }) => {
                    const values = await popup.open({
                      label: "Add Slide",
                      fields: {
                        titleLevel: {
                          type: "string",
                          label: "Title Level",
                          name: "titleLevel",
                          options: [
                            { value: "h2", label: "H2 (##)" },
                            { value: "h3", label: "H3 (###)" },
                          ],
                          required: true,
                          defaultItem: "h3",
                        },
                        title: {
                          type: "string",
                          label: "Slide Title",
                          name: "title",
                        },
                        text: {
                          type: "string",
                          label: "Slide Text",
                          name: "text",
                          ui: { component: "textarea" },
                        },
                        variant: {
                          type: "string",
                          label: "Layout",
                          name: "variant",
                          options: [
                            { value: "phoneFrame", label: "Phone Frame" },
                            { value: "screenshotBox", label: "Screenshot Box" },
                          ],
                          required: true,
                          defaultItem: "phoneFrame",
                        },
                        image: { type: "image", label: "Image", name: "image" },
                        caption: {
                          type: "string",
                          label: "Caption (defaults to title)",
                          name: "caption",
                        },
                        top: {
                          type: "string",
                          label: 'Top (default "8%")',
                          name: "top",
                        },
                        left: {
                          type: "string",
                          label: 'Left (default "7.5%")',
                          name: "left",
                        },
                        width: {
                          type: "string",
                          label: 'Width (default "85%")',
                          name: "width",
                        },
                        height: {
                          type: "string",
                          label: 'Height (default "84%")',
                          name: "height",
                        },
                      },
                    });

                    const md = makeSlide({
                      variant: (values?.variant as "phoneFrame" | "screenshotBox") || "phoneFrame",
                      titleLevel: (values?.titleLevel as "h2" | "h3") || "h3",
                      title: values?.title as string,
                      text: values?.text as string,
                      image: values?.image as string,
                      caption: values?.caption as string,
                      top: values?.top as string,
                      left: values?.left as string,
                      width: values?.width as string,
                      height: values?.height as string,
                    });

                    editor.insert(md);
                  },
                },
                {
                  name: "New Slide Separator",
                  icon: "⎯⎯",
                  action: ({ editor }) => editor.insert("\n---\n\n"),
                },
              ],
            },
          },
        ],
      },

      /**
       * Sidebars JSON — unchanged, you already manage these here.
       */
      {
        name: "sidebars",
        label: "Sidebar Configuration",
        path: "src/sidebars",
        format: "json",
        match: { include: "sidebars.json" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "object", name: "daSidebar",  label: "Android - Deploy App", list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
          { type: "object", name: "takSidebar", label: "Android - TAK",        list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
          { type: "object", name: "blSidebar",  label: "Android - Battlelog",  list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
          { type: "object", name: "iosDaSidebar", label: "iOS - Deploy App",   list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
          { type: "object", name: "iosTakSidebar", label: "iOS - TAK",         list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
          { type: "object", name: "iosBlSidebar",  label: "iOS - Battlelog",   list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
          { type: "object", name: "winDaSidebar",  label: "Windows - Deploy App", list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
          { type: "object", name: "winTakSidebar", label: "Windows - TAK",        list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
          { type: "object", name: "winBlSidebar",  label: "Windows - Battlelog",  list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
          { type: "object", name: "devSidebar",    label: "Developer",            list: true, ui: { itemProps: (i) => ({ label: i?.label || i?.id || "Item" }) }, fields: sidebarItemFields() },
        ],
      },
    ],
  },
});
