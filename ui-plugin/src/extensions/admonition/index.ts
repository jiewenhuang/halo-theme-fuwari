import {
  InputRule,
  mergeAttributes,
  Node,
  type Editor,
  VueNodeViewRenderer,
} from "@halo-dev/richtext-editor";
import { markRaw } from "vue";
import AlertIcon from "~icons/octicon/alert-16";
import InfoIcon from "~icons/octicon/info-16";
import LightBulbIcon from "~icons/octicon/light-bulb-16";
import MegaphoneIcon from "~icons/octicon/megaphone-16";
import StopIcon from "~icons/octicon/stop-16";

import AdmonitionView from "./AdmonitionView.vue";
import {
  ADMONITION_EXTENSION_PRIORITY,
  ADMONITION_INPUT_REGEX,
  ADMONITION_PARSE_RULES,
  ADMONITION_TAG,
  ADMONITIONS,
  createAdmonitionContent,
  getAdmonitionAttrsFromElement,
  getAdmonitionTitleFromAttributes,
  getAdmonitionTitleFromElement,
  normalizeAdmonitionType,
  normalizeAdmonitionTitle,
  renderAdmonitionTitle,
  type AdmonitionType,
} from "./constants";

interface CommandRange {
  from: number;
  to: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fuwariAdmonition: {
      insertFuwariAdmonition: (type: AdmonitionType) => ReturnType;
    };
  }
}

const iconMap = {
  note: InfoIcon,
  tip: LightBulbIcon,
  important: MegaphoneIcon,
  warning: AlertIcon,
  caution: StopIcon,
} satisfies Record<AdmonitionType, unknown>;

export const FuwariAdmonition = Node.create({
  name: "fuwariAdmonition",

  priority: ADMONITION_EXTENSION_PRIORITY,

  group: "block",

  content: "block+",

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      type: {
        default: "note",
        parseHTML: (element: HTMLElement) => {
          const attrs = getAdmonitionAttrsFromElement(element);

          return attrs ? attrs.type : undefined;
        },
        renderHTML: (attributes: { type?: AdmonitionType }) => {
          const type = normalizeAdmonitionType(attributes.type);

          return {
            type,
          };
        },
      },
      title: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          return getAdmonitionTitleFromElement(element);
        },
        renderHTML: (attributes: { title?: string | null }) => {
          const title = normalizeAdmonitionTitle(attributes.title);

          return title
            ? {
                "custom-title": title,
              }
            : {};
        },
      },
    };
  },

  parseHTML() {
    return ADMONITION_PARSE_RULES;
  },

  renderHTML({ HTMLAttributes }) {
    const type = normalizeAdmonitionType(HTMLAttributes.type);
    const title = getAdmonitionTitleFromAttributes(HTMLAttributes);
    const { title: _title, ...restAttributes } = HTMLAttributes;
    const attributes = mergeAttributes(restAttributes, {
      type,
      class: `admonition bdm-${type}`,
      "data-fuwari-admonition": type,
      ...(title ? { "custom-title": title } : {}),
    });

    return [
      ADMONITION_TAG,
      attributes,
      ["span", { class: "bdm-title" }, renderAdmonitionTitle(type, title)],
      ["div", { class: "bdm-content" }, 0],
    ];
  },

  addCommands() {
    return {
      insertFuwariAdmonition:
        (type: AdmonitionType) =>
        ({ commands }) => {
          return commands.insertContent(createAdmonitionContent(type));
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: ADMONITION_INPUT_REGEX,
        handler: ({ range, commands }) => {
          commands.deleteRange(range);
          commands.insertFuwariAdmonition("note");
        },
      }),
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(AdmonitionView);
  },

  addOptions() {
    return {
      ...this.parent?.(),
      getCommandMenuItems() {
        return ADMONITIONS.map((admonition, index) => ({
          priority: 160 + index,
          icon: markRaw(iconMap[admonition.type]),
          title: admonition.commandTitle,
          keywords: admonition.keywords,
          command: ({
            editor,
            range,
          }: {
            editor: Editor;
            range: CommandRange;
          }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertFuwariAdmonition(admonition.type)
              .run();
          },
        }));
      },
    };
  },
});
