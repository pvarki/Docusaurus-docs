// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var baseSubpath = (process.env.DOCS_BASEURL || "/Docusaurus-docs").replace(/^\/|\/$/g, "");
var defaults = { top: "8%", left: "7.5%", width: "85%", height: "84%" };
var trim = (s) => (s ?? "").trim();
var esc = (s) => s.replace(/\n+/g, " ").replace(/\|/g, "\\|").replace(/"/g, '\\"');
var normalizeImage = (p) => {
  if (!p) return "";
  const cleaned = p.replace(/^static\//, "").replace(/^public\//, "");
  return "/" + cleaned.replace(/^\/+/, "");
};
var mdHeading = (lvl, title) => title ? lvl === "h2" ? `## ${trim(title)}` : `### ${trim(title)}` : "";
function makeSlide(params) {
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
    height
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
  const body = text ? `
${trim(text)}
` : "\n";
  return `
---
${heading}${heading ? "\n" : ""}${block}${body}`;
}
function sidebarItemFields() {
  return [
    {
      type: "string",
      name: "type",
      label: "Type",
      options: [
        { value: "doc", label: "Document" },
        { value: "category", label: "Category" }
      ],
      required: true
    },
    {
      type: "string",
      name: "id",
      label: "Document ID",
      description: "Path to document (e.g., android/deployapp/home)",
      required: false
    },
    {
      type: "string",
      name: "label",
      label: "Display Label",
      required: true
    },
    {
      type: "boolean",
      name: "collapsed",
      label: "Collapsed by default",
      description: "Only for categories"
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
            { value: "category", label: "Category" }
          ]
        },
        { type: "string", name: "id", label: "Document ID" },
        { type: "string", name: "label", label: "Display Label" }
      ]
    }
  ];
}
var config_default = defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  /**
   * Build Tina admin under static/admin so Docusaurus copies it to build/<baseUrl>/admin
   */
  build: {
    outputFolder: "admin",
    publicFolder: "static",
    basePath: baseSubpath
    // respect DOCS_BASEURL, no leading/trailing slash
  },
  /**
   * Media: drag & drop → static/img/** → site URL /img/**
   */
  media: {
    tina: {
      mediaRoot: "img",
      publicFolder: "static"
    }
  },
  schema: {
    collections: [
      /**
       * Regular pages (if you keep content at repo root).
       */
      {
        name: "pages",
        label: "Pages",
        path: "/",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Title" },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
            toolbarOverride: [
              "heading",
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
              "raw"
            ]
          }
        ]
      },
      /**
       * Slide Decks – authors add slides via “Embed” (templates below).
       */
      {
        name: "decks",
        label: "Slide Decks",
        path: "src/decks",
        format: "md",
        ui: {
          allowedActions: { delete: true },
          filename: {
            slugify: (values) => (values?.title || "untitled-deck").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
          }
        },
        fields: [
          { type: "string", name: "title", label: "Deck title" },
          {
            type: "string",
            name: "deckPath",
            label: "Output path",
            required: true,
            description: "Used by your build/export script."
          },
          {
            type: "rich-text",
            name: "body",
            label: "Slides",
            isBody: true,
            toolbarOverride: [
              "heading",
              "bold",
              "italic",
              "link",
              "ul",
              "ol",
              "hr",
              "embed",
              "raw"
            ],
            /**
             * Templates define “embeds” in the toolbar. We provide two:
             *  - Phone Frame → @[phoneFrame](screenshot="...", ...)
             *  - Screenshot Box → @[screenshotBox](screenshot="...", ...)
             */
            templates: [
              {
                name: "phoneFrame",
                label: "Phone Frame",
                match: {
                  start: "@[phoneFrame](",
                  end: ")"
                },
                ui: {
                  defaultItem: {
                    top: defaults.top,
                    left: defaults.left,
                    width: defaults.width,
                    height: defaults.height
                  }
                },
                fields: [
                  { type: "image", name: "screenshot", label: "Screenshot" },
                  { type: "string", name: "alt", label: "Alt text" },
                  { type: "string", name: "caption", label: "Caption" },
                  { type: "string", name: "top", label: "Top (e.g. 8%)" },
                  { type: "string", name: "left", label: "Left (e.g. 7.5%)" },
                  { type: "string", name: "width", label: "Width (e.g. 85%)" },
                  { type: "string", name: "height", label: "Height (e.g. 84%)" }
                ],
                /**
                 * Provide a friendly insert flow:
                 * When the editor clicks “Embed → Phone Frame”, we prompt for title/text too
                 * and insert a complete slide (separator + heading + shortcode + text).
                 */
                uiMenu: {
                  name: "Insert Slide (Phone Frame)"
                },
                // @ts-ignore (ui.insert is supported at runtime)
                uiInsert: async ({ editor, popup }) => {
                  const values = await popup.open({
                    label: "New Slide (Phone Frame)",
                    fields: {
                      titleLevel: {
                        type: "string",
                        label: "Title Level",
                        name: "titleLevel",
                        options: [
                          { value: "h2", label: "H2 (##)" },
                          { value: "h3", label: "H3 (###)" }
                        ],
                        required: true,
                        defaultItem: "h3"
                      },
                      title: { type: "string", label: "Slide Title", name: "title" },
                      text: {
                        type: "string",
                        label: "Slide Text",
                        name: "text",
                        ui: { component: "textarea" }
                      },
                      screenshot: { type: "image", label: "Screenshot", name: "screenshot" },
                      caption: {
                        type: "string",
                        label: "Caption (defaults to title)",
                        name: "caption"
                      },
                      top: { type: "string", label: 'Top (default "8%")', name: "top" },
                      left: { type: "string", label: 'Left (default "7.5%")', name: "left" },
                      width: { type: "string", label: 'Width (default "85%")', name: "width" },
                      height: { type: "string", label: 'Height (default "84%")', name: "height" }
                    }
                  });
                  const md = makeSlide({
                    variant: "phoneFrame",
                    titleLevel: values?.titleLevel || "h3",
                    title: values?.title,
                    text: values?.text,
                    image: values?.screenshot,
                    caption: values?.caption,
                    top: values?.top,
                    left: values?.left,
                    width: values?.width,
                    height: values?.height
                  });
                  editor.insert(md);
                }
              },
              {
                name: "screenshotBox",
                label: "Screenshot Box",
                match: {
                  start: "@[screenshotBox](",
                  end: ")"
                },
                fields: [
                  { type: "image", name: "screenshot", label: "Screenshot" },
                  { type: "string", name: "alt", label: "Alt text" },
                  { type: "string", name: "caption", label: "Caption" },
                  { type: "string", name: "top", label: "Top (e.g. 8%)" },
                  { type: "string", name: "left", label: "Left (e.g. 7.5%)" },
                  { type: "string", name: "width", label: "Width (e.g. 85%)" },
                  { type: "string", name: "height", label: "Height (e.g. 84%)" }
                ],
                uiMenu: {
                  name: "Insert Slide (Screenshot Box)"
                },
                // @ts-ignore
                uiInsert: async ({ editor, popup }) => {
                  const values = await popup.open({
                    label: "New Slide (Screenshot Box)",
                    fields: {
                      titleLevel: {
                        type: "string",
                        label: "Title Level",
                        name: "titleLevel",
                        options: [
                          { value: "h2", label: "H2 (##)" },
                          { value: "h3", label: "H3 (###)" }
                        ],
                        required: true,
                        defaultItem: "h3"
                      },
                      title: { type: "string", label: "Slide Title", name: "title" },
                      text: {
                        type: "string",
                        label: "Slide Text",
                        name: "text",
                        ui: { component: "textarea" }
                      },
                      screenshot: { type: "image", label: "Screenshot", name: "screenshot" },
                      caption: {
                        type: "string",
                        label: "Caption (defaults to title)",
                        name: "caption"
                      },
                      top: { type: "string", label: 'Top (default "8%")', name: "top" },
                      left: { type: "string", label: 'Left (default "7.5%")', name: "left" },
                      width: { type: "string", label: 'Width (default "85%")', name: "width" },
                      height: { type: "string", label: 'Height (default "84%")', name: "height" }
                    }
                  });
                  const md = makeSlide({
                    variant: "screenshotBox",
                    titleLevel: values?.titleLevel || "h3",
                    title: values?.title,
                    text: values?.text,
                    image: values?.screenshot,
                    caption: values?.caption,
                    top: values?.top,
                    left: values?.left,
                    width: values?.width,
                    height: values?.height
                  });
                  editor.insert(md);
                }
              }
            ]
          }
        ]
      },
      /**
       * Sidebars JSON
       */
      {
        name: "sidebars",
        label: "Sidebar Configuration",
        path: "src/sidebars",
        format: "json",
        match: {
          include: "sidebars.json"
        },
        ui: {
          allowedActions: { create: false, delete: false }
        },
        fields: [
          {
            type: "object",
            name: "daSidebar",
            label: "Android - Deploy App",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          },
          {
            type: "object",
            name: "takSidebar",
            label: "Android - TAK",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          },
          {
            type: "object",
            name: "blSidebar",
            label: "Android - Battlelog",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          },
          {
            type: "object",
            name: "iosDaSidebar",
            label: "iOS - Deploy App",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          },
          {
            type: "object",
            name: "iosTakSidebar",
            label: "iOS - TAK",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          },
          {
            type: "object",
            name: "iosBlSidebar",
            label: "iOS - Battlelog",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          },
          {
            type: "object",
            name: "winDaSidebar",
            label: "Windows - Deploy App",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          },
          {
            type: "object",
            name: "winTakSidebar",
            label: "Windows - TAK",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          },
          {
            type: "object",
            name: "winBlSidebar",
            label: "Windows - Battlelog",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          },
          {
            type: "object",
            name: "devSidebar",
            label: "Developer",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || "Item" }) },
            fields: sidebarItemFields()
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
