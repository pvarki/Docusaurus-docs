// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  // Get this from tina.io
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public"
    }
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
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
            required: false
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true
          }
        ]
      },
      {
        name: "sidebar",
        label: "Sidebar",
        path: "src/sidebars",
        format: "json",
        match: {
          include: "index.json"
        },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Sidebar Items",
            list: true,
            fields: [
              {
                type: "string",
                name: "type",
                label: "Type",
                options: [
                  { value: "category", label: "Category" },
                  { value: "doc", label: "Doc" }
                ]
              },
              {
                type: "string",
                name: "label",
                label: "Label",
                required: false
              },
              {
                type: "string",
                name: "id",
                label: "Doc ID",
                required: false
              },
              {
                type: "object",
                name: "items",
                label: "Items",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "type",
                    label: "Type",
                    options: [
                      { value: "category", label: "Category" },
                      { value: "doc", label: "Doc" }
                    ]
                  },
                  {
                    type: "string",
                    name: "label",
                    label: "Label",
                    required: false
                  },
                  {
                    type: "string",
                    name: "id",
                    label: "Doc ID",
                    required: false
                  }
                ],
                required: false
              }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
