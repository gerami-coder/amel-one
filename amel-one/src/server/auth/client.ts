import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { authConfig } from "./config";
import type { Database } from "@/server/db/database.types";
export async function serverClient() {
  const jar = await cookies();
  const { url, key } = authConfig();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        // Server Components cannot write cookies; proxy performs session refresh.
        try {
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          /* Cookie writes are supported in actions and route handlers. */
        }
      },
    },
  });
}
