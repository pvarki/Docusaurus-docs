// tina/config.ts
import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

// Helper function for sidebar item fields
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
        // Recursive structure for nested items
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
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
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
          // Android sidebars
          {
            type: "object",
            name: "daSidebar",
            label: "Android - Deploy App",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "takSidebar",
            label: "Android - TAK",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "blSidebar",
            label: "Android - Battlelog",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
          // iOS sidebars
          {
            type: "object",
            name: "iosDaSidebar",
            label: "iOS - Deploy App",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "iosTakSidebar",
            label: "iOS - TAK",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "iosBlSidebar",
            label: "iOS - Battlelog",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
          // Windows sidebars
          {
            type: "object",
            name: "winDaSidebar",
            label: "Windows - Deploy App",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "winTakSidebar",
            label: "Windows - TAK",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
          {
            type: "object",
            name: "winBlSidebar",
            label: "Windows - Battlelog",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
          // Dev sidebar
          {
            type: "object",
            name: "devSidebar",
            label: "Developer",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || item?.id || 'Item',
              }),
            },
            fields: sidebarItemFields(),
          },
        ],
      },
    ],
  },
});