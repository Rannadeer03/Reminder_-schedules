import { defineConfig } from "@trigger.dev/sdk/v3";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
  project: "proj_lzloiivxeopxrhoovpwj",
  dirs: ["src/trigger"],
  maxDuration: 300,
  build: {
    extensions: [
      prismaExtension({
        mode: "legacy",
        schema: "prisma/schema.prisma",
        directUrlEnvVarName: "DIRECT_URL",
      }),
    ],
  },
});
