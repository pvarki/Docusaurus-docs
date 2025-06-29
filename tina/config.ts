// tina/config.ts
import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

/**
 * Helper function to define consistent sidebar item fields
 * Ensures DRY principle for reusable field configurations
 */
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
    {
      type: "string",
      name: "label",
      label: "Display Label",
      required: true,
    },
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
        {
          type: "string",
          name: "id",
          label: "Document ID",
        },
        {
          type: "string",
          name: "label",
          label: "Display Label",
        },
      ],
    },
  ];
}

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID!,
  token: process.env.TINA_TOKEN!,
  
 build: {
   outputFolder: "admin",           // stays the same
   publicFolder: "static",          // Docusaurus copies /static/** automatically
   basePath: (process.env.DOCS_BASEURL || "/Docusaurus-docs")
              .replace(/^\/|\/$/g, ""),   // strip leading & trailing “/”
 },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  
  schema: {
    collections: [
      {
        name: "pages",
        label: "Pages",
        path: "/",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            required: false,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name:  "decks",
        label: "Slide Decks",
        path:  "src/decks", 
        format: "md",
        ui: { allowedActions: { delete: true } },
        fields: [
          { type: "string", name: "title",     label: "Deck title" },
          { type: "string", name: "deckPath",  label: "Output path", required: true },

          /* Writers work inside this ONE field */
          {
            type: "rich-text",
            name: "body",
            label: "Slides",
            isBody: true,
            ui: {
              /* remove everything except what we allow */
              toolbar: [
                "heading1",
                "heading2",
                "|",
                "bold",
                "italic",
                "link",
                "|",
                {                 // ➜  New-Slide button
                  name: "New Slide",
                  icon: "➕",
                  action: ({ editor }) => {
                    editor.insert('\n\n---\n\n');
                  },
                },
                {                 // ➜  ScreenshotBox button
                  name: "Screenshot",
                  icon: "🖼️",
                  action: async ({ editor, popup }) => {
                    const { image, caption } = await popup.open({
                      fields: {
                        image:   { type: "image",  label: "Image"   },
                        caption: { type: "string", label: "Caption" }
                      }
                    });
                    editor.insert(
                    `\n@[screenshotBox](
                      screenshot="${image}",
                      alt="${caption}",
                      caption="${caption}"
                    )\n`
                    );
                  },
                },
                {                 // ➜  PhoneFrame button
                  name: "Phone-Frame",
                  icon: "📱",
                  action: async ({ editor, popup }) => {
                    const { image, caption } = await popup.open({
                      fields: {
                        image:   { type: "image",  label: "Screenshot" },
                        caption: { type: "string", label: "Caption"    }
                      }
                    });
                    editor.insert(
                    `\n@[phoneFrame](
                      screenshot="${image}",
                      alt="${caption}",
                      top="8%", left="7%", width="85%", height="84%",
                      caption="${caption}"
                    )\n`
                    );
                  },
                },
              ],
            },
          },
        ],
      },
      {
        name: "sidebars",
        label: "Sidebar Configuration",
        path: "src/sidebars",
        format: "json",
        match: {
          include: "sidebars.json",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "object",
            name: "daSidebar",
            label: "Android - Deploy App",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "takSidebar",
            label: "Android - TAK",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "blSidebar",
            label: "Android - Battlelog",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "iosDaSidebar",
            label: "iOS - Deploy App",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "iosTakSidebar",
            label: "iOS - TAK",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "iosBlSidebar",
            label: "iOS - Battlelog",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "winDaSidebar",
            label: "Windows - Deploy App",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "winTakSidebar",
            label: "Windows - TAK",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "winBlSidebar",
            label: "Windows - Battlelog",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "devSidebar",
            label: "Developer",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || item?.id || 'Item' }) },
            fields: sidebarItemFields(),
          },
        ],
      },
    ],
  },
});