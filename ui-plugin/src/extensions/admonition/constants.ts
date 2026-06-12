export type AdmonitionType =
  | "note"
  | "tip"
  | "important"
  | "warning"
  | "caution";

export interface AdmonitionDefinition {
  type: AdmonitionType;
  marker: string;
  title: string;
  commandTitle: string;
  keywords: string[];
}

export interface AdmonitionParseRule {
  tag: string;
  contentElement?: string | ((element: HTMLElement) => HTMLElement);
  priority: number;
  getAttrs?: (
    element: HTMLElement | string,
  ) => false | { type: AdmonitionType };
}

export interface AdmonitionTitleAttributes {
  title?: string | null;
  "custom-title"?: string | null;
  "data-title"?: string | null;
}

export const ADMONITION_TYPES: AdmonitionType[] = [
  "note",
  "tip",
  "important",
  "warning",
  "caution",
];

export const ADMONITION_INPUT_REGEX = /^:::$/;
export const ADMONITION_TAG = "fuwari-admonition";
export const ADMONITION_TITLE_SELECTOR = ".bdm-title";
export const ADMONITION_CONTENT_SELECTOR = ".bdm-content";
export const ADMONITION_EXTENSION_PRIORITY = 1_000;
export const ADMONITION_LEGACY_PARSE_PRIORITY =
  ADMONITION_EXTENSION_PRIORITY - 1;

export const ADMONITIONS: AdmonitionDefinition[] = [
  {
    type: "note",
    marker: "NOTE",
    title: "提示框",
    commandTitle: "提示框",
    keywords: ["note", "tishi", "提示"],
  },
  {
    type: "tip",
    marker: "TIP",
    title: "技巧提示",
    commandTitle: "技巧提示",
    keywords: ["tip", "jiqiao", "技巧"],
  },
  {
    type: "important",
    marker: "IMPORTANT",
    title: "重要信息",
    commandTitle: "重要信息块",
    keywords: ["important", "zhongyao", "重要", "信息"],
  },
  {
    type: "warning",
    marker: "WARNING",
    title: "警告信息",
    commandTitle: "警告信息",
    keywords: ["warning", "jinggao", "警告"],
  },
  {
    type: "caution",
    marker: "CAUTION",
    title: "注意信息",
    commandTitle: "注意信息",
    keywords: ["caution", "zhuyi", "注意"],
  },
];

export const DEFAULT_ADMONITION: AdmonitionDefinition =
  ADMONITIONS[0] as AdmonitionDefinition;

export const ADMONITION_PARSE_RULES: AdmonitionParseRule[] = [
  {
    tag: ADMONITION_TAG,
    contentElement: getAdmonitionContentElement,
    priority: ADMONITION_EXTENSION_PRIORITY,
    getAttrs: getAdmonitionAttrsFromElement,
  },
  {
    tag: "blockquote[data-fuwari-admonition]",
    contentElement: getAdmonitionContentElement,
    priority: ADMONITION_LEGACY_PARSE_PRIORITY,
    getAttrs: getAdmonitionAttrsFromElement,
  },
  {
    tag: "blockquote.admonition",
    contentElement: getAdmonitionContentElement,
    priority: ADMONITION_LEGACY_PARSE_PRIORITY,
    getAttrs: getAdmonitionAttrsFromElement,
  },
  {
    tag: "blockquote",
    contentElement: getAdmonitionContentElement,
    priority: ADMONITION_LEGACY_PARSE_PRIORITY,
    getAttrs: (element) => {
      const type = getAdmonitionTypeFromMarkerElement(element);

      return type ? { type } : false;
    },
  },
];

export function getAdmonition(type: AdmonitionType): AdmonitionDefinition {
  return (
    ADMONITIONS.find((admonition) => admonition.type === type) ??
    DEFAULT_ADMONITION
  );
}

export function createAdmonitionContent(type: AdmonitionType) {
  const admonition = getAdmonition(type);

  return {
    type: "fuwariAdmonition",
    attrs: {
      type: admonition.type,
    },
    content: [
      {
        type: "paragraph",
      },
    ],
  };
}

export function normalizeAdmonitionType(value?: string | null): AdmonitionType {
  const type = value?.trim().toLowerCase();

  return ADMONITIONS.some((admonition) => admonition.type === type)
    ? (type as AdmonitionType)
    : "note";
}

export function normalizeAdmonitionTitle(
  value?: string | null,
): string | undefined {
  const title = value?.replace(/\s+/g, " ").trim();

  return title || undefined;
}

export function getEditableAdmonitionTitle(value?: string | null): string {
  return normalizeAdmonitionTitle(value) ?? "";
}

export function getAdmonitionTitleFromAttributes(
  attributes: AdmonitionTitleAttributes,
): string | undefined {
  return (
    normalizeAdmonitionTitle(attributes.title) ||
    normalizeAdmonitionTitle(attributes["custom-title"]) ||
    normalizeAdmonitionTitle(attributes["data-title"])
  );
}

export function renderAdmonitionTitle(
  type: AdmonitionType,
  title?: string | null,
): string {
  const admonition = getAdmonition(type);
  const customTitle = normalizeAdmonitionTitle(title);

  return customTitle ?? admonition.marker;
}

export function getAdmonitionTypeFromMarker(
  value?: string | null,
): AdmonitionType | undefined {
  const marker = value
    ?.trim()
    .match(/^\[?!?([A-Za-z]+)\]?$/)?.[1]
    ?.toLowerCase();

  return ADMONITIONS.find((admonition) => admonition.type === marker)?.type;
}

export function getAdmonitionAttrsFromElement(
  element: HTMLElement | string,
): false | { type: AdmonitionType } {
  if (!isElementLike(element)) {
    return false;
  }

  const type =
    getAdmonitionType(element.getAttribute("type")) ||
    getAdmonitionType(element.getAttribute("data-fuwari-admonition")) ||
    getAdmonitionTypeFromClassName(element) ||
    getAdmonitionTypeFromMarkerElement(element);

  if (type) {
    return { type };
  }

  if (isAdmonitionElement(element)) {
    return { type: DEFAULT_ADMONITION.type };
  }

  return false;
}

export function getAdmonitionTitleFromElement(
  element: HTMLElement | string,
): string | undefined {
  if (!isElementLike(element)) {
    return undefined;
  }

  const title =
    normalizeAdmonitionTitle(element.getAttribute("custom-title")) ||
    normalizeAdmonitionTitle(element.getAttribute("data-title"));

  if (title) {
    return title;
  }

  const titleElement = element.querySelector(ADMONITION_TITLE_SELECTOR);

  if (!titleElement) {
    return undefined;
  }

  return getAdmonitionTitleFromText(titleElement.textContent);
}

export function getAdmonitionContentElement(element: HTMLElement): HTMLElement {
  const contentElement = element.querySelector(ADMONITION_CONTENT_SELECTOR);

  if (isElementLike(contentElement)) {
    return contentElement;
  }

  const document = element.ownerDocument;
  const wrapper = document.createElement("div");
  const children = Array.from(element.children);
  const contentChildren = isMarkerElement(children[0])
    ? children.slice(1)
    : children;

  contentChildren.forEach((child) => {
    wrapper.appendChild(child.cloneNode(true));
  });

  if (!wrapper.childNodes.length) {
    wrapper.appendChild(document.createElement("p"));
  }

  return wrapper;
}

function getAdmonitionTypeFromClassName(
  element: HTMLElement,
): AdmonitionType | undefined {
  const className = element.getAttribute("class") ?? "";

  return ADMONITIONS.find((admonition) =>
    className.split(/\s+/).includes(`bdm-${admonition.type}`),
  )?.type;
}

function getAdmonitionTitleFromText(value?: string | null): string | undefined {
  const text = normalizeAdmonitionTitle(value);

  if (!text) {
    return undefined;
  }

  for (const admonition of ADMONITIONS) {
    const markerPattern = new RegExp(`^${admonition.marker}\\b\\s*`, "i");

    if (markerPattern.test(text)) {
      return normalizeAdmonitionTitle(text.replace(markerPattern, ""));
    }
  }

  return text;
}

function getAdmonitionType(value?: string | null): AdmonitionType | undefined {
  const type = value?.trim().toLowerCase();

  return ADMONITIONS.find((admonition) => admonition.type === type)?.type;
}

function getAdmonitionTypeFromMarkerElement(
  element: HTMLElement | string,
): AdmonitionType | undefined {
  if (!isElementLike(element)) {
    return undefined;
  }

  return getAdmonitionTypeFromMarker(element.children[0]?.textContent);
}

function isMarkerElement(element?: Element): boolean {
  if (!element) {
    return false;
  }

  const className = element.getAttribute("class") ?? "";

  return (
    className.split(/\s+/).includes("bdm-title") ||
    !!getAdmonitionTypeFromMarker(element.textContent)
  );
}

function isAdmonitionElement(element: HTMLElement): boolean {
  const tagName = element.tagName?.toLowerCase();
  const className = element.getAttribute("class") ?? "";

  return (
    tagName === ADMONITION_TAG ||
    element.getAttribute("data-fuwari-admonition") !== null ||
    className.split(/\s+/).includes("admonition")
  );
}

function isElementLike(element: unknown): element is HTMLElement {
  return (
    typeof element === "object" &&
    element !== null &&
    "getAttribute" in element &&
    "querySelector" in element
  );
}
