import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '19e195e2308dfd7496ebc8f228a46fd23e0db887', queries,  });
export default client;
  