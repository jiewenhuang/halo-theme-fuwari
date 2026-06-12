import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADMONITION_CONTENT_SELECTOR,
  ADMONITION_EXTENSION_PRIORITY,
  ADMONITION_INPUT_REGEX,
  ADMONITION_LEGACY_PARSE_PRIORITY,
  ADMONITION_PARSE_RULES,
  ADMONITION_TAG,
  ADMONITION_TYPES,
  createAdmonitionContent,
  getAdmonition,
  getAdmonitionAttrsFromElement,
  getAdmonitionTitleFromAttributes,
  getAdmonitionTitleFromElement,
  getAdmonitionTypeFromMarker,
  getEditableAdmonitionTitle,
  normalizeAdmonitionType,
  renderAdmonitionTitle,
} from "../src/extensions/admonition/constants.ts";

describe("admonition content contract", () => {
  it("defines the five GitHub-style admonition types", () => {
    assert.deepEqual(ADMONITION_TYPES, [
      "note",
      "tip",
      "important",
      "warning",
      "caution",
    ]);
  });

  it("creates custom admonition content for the default rich text editor", () => {
    const content = createAdmonitionContent("warning");

    assert.equal(content.type, "fuwariAdmonition");
    assert.deepEqual(content.attrs, { type: "warning" });
    assert.deepEqual(content.content, [
      {
        type: "paragraph",
      },
    ]);
  });

  it("exposes labels and marker text for front-end rendering", () => {
    assert.deepEqual(getAdmonition("important"), {
      type: "important",
      marker: "IMPORTANT",
      title: "重要信息",
      commandTitle: "重要信息块",
      keywords: ["important", "zhongyao", "重要", "信息"],
    });
  });

  it("uses a content wrapper so the rendered title is not parsed as body content", () => {
    assert.equal(ADMONITION_CONTENT_SELECTOR, ".bdm-content");
  });

  it("uses a dedicated HTML tag like the reference editor plugin", () => {
    assert.equal(ADMONITION_TAG, "fuwari-admonition");
  });

  it("takes precedence over the default blockquote parser when content is reopened", () => {
    assert.ok(ADMONITION_EXTENSION_PRIORITY > 100);
  });

  it("keeps every admonition parse rule ahead of the default blockquote parser", () => {
    assert.deepEqual(
      ADMONITION_PARSE_RULES.map(({ tag, priority }) => ({
        tag,
        priority,
      })),
      [
        {
          tag: "fuwari-admonition",
          priority: ADMONITION_EXTENSION_PRIORITY,
        },
        {
          tag: "blockquote[data-fuwari-admonition]",
          priority: ADMONITION_LEGACY_PARSE_PRIORITY,
        },
        {
          tag: "blockquote.admonition",
          priority: ADMONITION_LEGACY_PARSE_PRIORITY,
        },
        {
          tag: "blockquote",
          priority: ADMONITION_LEGACY_PARSE_PRIORITY,
        },
      ],
    );
  });

  it("recognizes GitHub-style and saved marker labels without matching ordinary text", () => {
    assert.equal(getAdmonitionTypeFromMarker("[!NOTE]"), "note");
    assert.equal(getAdmonitionTypeFromMarker("IMPORTANT"), "important");
    assert.equal(getAdmonitionTypeFromMarker("NOTE something"), undefined);
  });

  it("normalizes persisted type attributes case-insensitively", () => {
    assert.equal(normalizeAdmonitionType("WARNING"), "warning");
    assert.equal(normalizeAdmonitionType("unknown"), "note");
  });

  it("detects canonical custom element type attributes", () => {
    const attrs = getAdmonitionAttrsFromElement({
      tagName: "FUWARI-ADMONITION",
      getAttribute(name: string) {
        return name === "type" ? "tip" : null;
      },
      querySelector() {
        return null;
      },
      children: [],
    } as unknown as HTMLElement);

    assert.deepEqual(attrs, { type: "tip" });
  });

  it("detects canonical custom title attributes", () => {
    const title = getAdmonitionTitleFromElement({
      getAttribute(name: string) {
        return name === "custom-title" ? "可编辑标题" : null;
      },
      querySelector() {
        return null;
      },
      children: [],
    } as unknown as HTMLElement);

    assert.equal(title, "可编辑标题");
  });

  it("recovers custom titles from saved title labels", () => {
    const title = getAdmonitionTitleFromElement({
      getAttribute() {
        return null;
      },
      querySelector(selector: string) {
        return selector === ".bdm-title"
          ? { textContent: "WARNING 线上风险" }
          : null;
      },
      children: [],
    } as unknown as HTMLElement);

    assert.equal(title, "线上风险");
  });

  it("uses the marker only when there is no custom title", () => {
    assert.equal(renderAdmonitionTitle("warning", "线上风险"), "线上风险");
    assert.equal(renderAdmonitionTitle("warning"), "WARNING");
  });

  it("reads rendered custom-title attributes when serializing HTML", () => {
    assert.equal(
      getAdmonitionTitleFromAttributes({ "custom-title": "11" }),
      "11",
    );
    assert.equal(
      getAdmonitionTitleFromAttributes({ title: "内部标题" }),
      "内部标题",
    );
  });

  it("does not use menu labels as default editable titles", () => {
    assert.equal(getEditableAdmonitionTitle(undefined), "");
    assert.equal(getEditableAdmonitionTitle("  线上风险  "), "线上风险");
  });

  it("detects saved admonition attributes without relying on cross-window HTMLElement checks", () => {
    const attrs = getAdmonitionAttrsFromElement({
      getAttribute(name: string) {
        return name === "data-fuwari-admonition" ? "warning" : "";
      },
      querySelector() {
        return null;
      },
      children: [],
    } as unknown as HTMLElement);

    assert.deepEqual(attrs, { type: "warning" });
  });

  it("recovers saved class-based admonitions when the data attribute is unavailable", () => {
    const attrs = getAdmonitionAttrsFromElement({
      getAttribute(name: string) {
        return name === "class" ? "admonition bdm-important" : null;
      },
      querySelector() {
        return null;
      },
      children: [],
    } as unknown as HTMLElement);

    assert.deepEqual(attrs, { type: "important" });
  });

  it("recovers degraded quote blocks whose first paragraph is an admonition marker", () => {
    const attrs = getAdmonitionAttrsFromElement({
      getAttribute() {
        return null;
      },
      querySelector() {
        return null;
      },
      children: [{ textContent: "NOTE" }],
    } as unknown as HTMLElement);

    assert.deepEqual(attrs, { type: "note" });
  });

  it("supports the shorthand trigger requested for the editor", () => {
    assert.match(":::", ADMONITION_INPUT_REGEX);
    assert.doesNotMatch("text :::", ADMONITION_INPUT_REGEX);
  });
});
