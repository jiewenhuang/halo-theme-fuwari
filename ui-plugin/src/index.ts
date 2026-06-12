import { definePlugin } from "@halo-dev/ui-shared";

import "./styles.css";

export default definePlugin({
  extensionPoints: {
    "default:editor:extension:create": async () => {
      const { FuwariAdmonition } = await import("./editor");
      return [FuwariAdmonition];
    },
  },
});
