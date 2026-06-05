import { defineConfig } from "@trigger.dev/sdk/v3";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { syncVercelEnvVars } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_lzloiivxeopxrhoovpwj",
  dirs: ["src/trigger"],
  maxDuration: 300,
  machine: "small-1x",
  build: {
    extensions: [
      syncVercelEnvVars(),
      prismaExtension({
        mode: "legacy",
        schema: "prisma/schema.prisma",
        directUrlEnvVarName: "DIRECT_URL",
      }),
    ],
  },
});
