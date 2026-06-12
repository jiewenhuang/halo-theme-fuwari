this["theme:theme-fuwari"] = (function (I, l, n) {
  "use strict";
  const C = I.definePlugin({
      extensionPoints: {
        "default:editor:extension:create": async () => {
          const { FuwariAdmonition: t } = await Promise.resolve().then(
            () => ct,
          );
          return [t];
        },
      },
    }),
    b = { viewBox: "0 0 16 16", width: "1.2em", height: "1.2em" };
  function M(t, e) {
    return (
      n.openBlock(),
      n.createElementBlock("svg", b, [
        ...(e[0] ||
          (e[0] = [
            n.createElementVNode(
              "path",
              {
                fill: "currentColor",
                d: "M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0M9 11a1 1 0 1 1-2 0a1 1 0 0 1 2 0",
              },
              null,
              -1,
            ),
          ])),
      ])
    );
  }
  const O = n.markRaw({ name: "octicon-alert-16", render: M }),
    R = { viewBox: "0 0 16 16", width: "1.2em", height: "1.2em" };
  function V(t, e) {
    return (
      n.openBlock(),
      n.createElementBlock("svg", R, [
        ...(e[0] ||
          (e[0] = [
            n.createElementVNode(
              "path",
              {
                fill: "currentColor",
                d: "M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-6.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13M6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75M8 6a1 1 0 1 1 0-2a1 1 0 0 1 0 2",
              },
              null,
              -1,
            ),
          ])),
      ])
    );
  }
  const B = n.markRaw({ name: "octicon-info-16", render: V }),
    L = { viewBox: "0 0 16 16", width: "1.2em", height: "1.2em" };
  function x(t, e) {
    return (
      n.openBlock(),
      n.createElementBlock("svg", L, [
        ...(e[0] ||
          (e[0] = [
            n.createElementVNode(
              "path",
              {
                fill: "currentColor",
                d: "M8 1.5c-2.363 0-4 1.69-4 3.75c0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848c.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a9 9 0 0 0-.542-.68l-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25C2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259q-.142.172-.268.319c-.207.245-.383.453-.541.681c-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489c.203-.292.45-.584.673-.848l.213-.253c.561-.679.985-1.32.985-2.304c0-2.06-1.637-3.75-4-3.75M5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5M6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75",
              },
              null,
              -1,
            ),
          ])),
      ])
    );
  }
  const $ = n.markRaw({ name: "octicon-light-bulb-16", render: x }),
    S = { viewBox: "0 0 16 16", width: "1.2em", height: "1.2em" };
  function F(t, e) {
    return (
      n.openBlock(),
      n.createElementBlock("svg", S, [
        ...(e[0] ||
          (e[0] = [
            n.createElementVNode(
              "path",
              {
                fill: "currentColor",
                d: "M3.25 9a.75.75 0 0 1 .75.75c0 2.142.456 3.828.733 4.653a.12.12 0 0 0 .05.064a.2.2 0 0 0 .117.033h1.31c.085 0 .18-.042.258-.152a.45.45 0 0 0 .075-.366A16.7 16.7 0 0 1 6 9.75a.75.75 0 0 1 1.5 0c0 1.588.25 2.926.494 3.85c.293 1.113-.504 2.4-1.783 2.4H4.9c-.686 0-1.35-.41-1.589-1.12A16.4 16.4 0 0 1 2.5 9.75A.75.75 0 0 1 3.25 9",
              },
              null,
              -1,
            ),
            n.createElementVNode(
              "path",
              {
                fill: "currentColor",
                d: "M0 6a4 4 0 0 1 4-4h2.75a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-.75.75H4a4 4 0 0 1-4-4m4-2.5a2.5 2.5 0 1 0 0 5h2v-5Z",
              },
              null,
              -1,
            ),
            n.createElementVNode(
              "path",
              {
                fill: "currentColor",
                d: "M15.59.082A.75.75 0 0 1 16 .75v10.5a.75.75 0 0 1-1.189.608l-.002-.001h.001l-.014-.01a6 6 0 0 0-.422-.25a10.6 10.6 0 0 0-1.469-.64C11.576 10.484 9.536 10 6.75 10a.75.75 0 0 1 0-1.5c2.964 0 5.174.516 6.658 1.043c.423.151.787.302 1.092.443V2.014c-.305.14-.669.292-1.092.443C11.924 2.984 9.713 3.5 6.75 3.5a.75.75 0 0 1 0-1.5c2.786 0 4.826-.484 6.155-.957c.665-.236 1.154-.47 1.47-.64q.216-.116.421-.25l.014-.01a.75.75 0 0 1 .78-.061",
              },
              null,
              -1,
            ),
          ])),
      ])
    );
  }
  const P = n.markRaw({ name: "octicon-megaphone-16", render: F }),
    D = { viewBox: "0 0 16 16", width: "1.2em", height: "1.2em" };
  function q(t, e) {
    return (
      n.openBlock(),
      n.createElementBlock("svg", D, [
        ...(e[0] ||
          (e[0] = [
            n.createElementVNode(
              "path",
              {
                fill: "currentColor",
                d: "M4.47.22A.75.75 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.75.75 0 0 1-.22.53l-4.25 4.25A.75.75 0 0 1 11 16H5a.75.75 0 0 1-.53-.22L.22 11.53A.75.75 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4m0 8a1 1 0 1 1 0-2a1 1 0 0 1 0 2",
              },
              null,
              -1,
            ),
          ])),
      ])
    );
  }
  const H = n.markRaw({ name: "octicon-stop-16", render: q }),
    v = /^:::$/,
    f = "fuwari-admonition",
    z = ".bdm-title",
    Z = ".bdm-content",
    A = 1e3,
    w = A - 1,
    a = [
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
    ],
    T = a[0],
    j = [
      { tag: f, contentElement: m, priority: A, getAttrs: d },
      {
        tag: "blockquote[data-fuwari-admonition]",
        contentElement: m,
        priority: w,
        getAttrs: d,
      },
      {
        tag: "blockquote.admonition",
        contentElement: m,
        priority: w,
        getAttrs: d,
      },
      {
        tag: "blockquote",
        contentElement: m,
        priority: w,
        getAttrs: (t) => {
          const e = _(t);
          return e ? { type: e } : !1;
        },
      },
    ];
  function y(t) {
    return a.find((e) => e.type === t) ?? T;
  }
  function U(t) {
    return {
      type: "fuwariAdmonition",
      attrs: { type: y(t).type },
      content: [{ type: "paragraph" }],
    };
  }
  function h(t) {
    const e = t?.trim().toLowerCase();
    return a.some((o) => o.type === e) ? e : "note";
  }
  function r(t) {
    return t?.replace(/\s+/g, " ").trim() || void 0;
  }
  function G(t) {
    return r(t) ?? "";
  }
  function Y(t) {
    return r(t.title) || r(t["custom-title"]) || r(t["data-title"]);
  }
  function W(t, e) {
    const o = y(t);
    return r(e) ?? o.marker;
  }
  function N(t) {
    const e = t
      ?.trim()
      .match(/^\[?!?([A-Za-z]+)\]?$/)?.[1]
      ?.toLowerCase();
    return a.find((o) => o.type === e)?.type;
  }
  function d(t) {
    if (!u(t)) return !1;
    const e =
      k(t.getAttribute("type")) ||
      k(t.getAttribute("data-fuwari-admonition")) ||
      K(t) ||
      _(t);
    return e ? { type: e } : tt(t) ? { type: T.type } : !1;
  }
  function X(t) {
    if (!u(t)) return;
    const e =
      r(t.getAttribute("custom-title")) || r(t.getAttribute("data-title"));
    if (e) return e;
    const o = t.querySelector(z);
    if (o) return J(o.textContent);
  }
  function m(t) {
    const e = t.querySelector(Z);
    if (u(e)) return e;
    const o = t.ownerDocument,
      i = o.createElement("div"),
      c = Array.from(t.children);
    return (
      (Q(c[0]) ? c.slice(1) : c).forEach((g) => {
        i.appendChild(g.cloneNode(!0));
      }),
      i.childNodes.length || i.appendChild(o.createElement("p")),
      i
    );
  }
  function K(t) {
    const e = t.getAttribute("class") ?? "";
    return a.find((o) => e.split(/\s+/).includes(`bdm-${o.type}`))?.type;
  }
  function J(t) {
    const e = r(t);
    if (e) {
      for (const o of a) {
        const i = new RegExp(`^${o.marker}\\b\\s*`, "i");
        if (i.test(e)) return r(e.replace(i, ""));
      }
      return e;
    }
  }
  function k(t) {
    const e = t?.trim().toLowerCase();
    return a.find((o) => o.type === e)?.type;
  }
  function _(t) {
    if (u(t)) return N(t.children[0]?.textContent);
  }
  function Q(t) {
    return t
      ? (t.getAttribute("class") ?? "").split(/\s+/).includes("bdm-title") ||
          !!N(t.textContent)
      : !1;
  }
  function tt(t) {
    const e = t.tagName?.toLowerCase(),
      o = t.getAttribute("class") ?? "";
    return (
      e === f ||
      t.getAttribute("data-fuwari-admonition") !== null ||
      o.split(/\s+/).includes("admonition")
    );
  }
  function u(t) {
    return (
      typeof t == "object" &&
      t !== null &&
      "getAttribute" in t &&
      "querySelector" in t
    );
  }
  const et = {
      class: "fuwari-admonition-view__title",
      contenteditable: "false",
    },
    nt = { key: 0, class: "fuwari-admonition-view__marker" },
    ot = ["value"],
    it = n.defineComponent({
      __name: "AdmonitionView",
      props: l.nodeViewProps,
      setup(t) {
        const e = t,
          o = n.computed(() => h(e.node.attrs.type)),
          i = n.computed(() => y(o.value)),
          c = n.computed(() => G(e.node.attrs.title)),
          p = n.computed(() => !!c.value);
        function g(E) {
          const s = E.target.value,
            lt = r(s);
          e.updateAttributes({ title: lt ?? null });
        }
        return (E, s) => (
          n.openBlock(),
          n.createBlock(
            n.unref(l.NodeViewWrapper),
            {
              as: "div",
              class: n.normalizeClass([
                "fuwari-admonition-view",
                "admonition",
                `bdm-${i.value.type}`,
              ]),
              "data-fuwari-admonition": i.value.type,
            },
            {
              default: n.withCtx(() => [
                n.createElementVNode("div", et, [
                  p.value
                    ? n.createCommentVNode("", !0)
                    : (n.openBlock(),
                      n.createElementBlock(
                        "span",
                        nt,
                        n.toDisplayString(i.value.marker),
                        1,
                      )),
                  n.createElementVNode(
                    "input",
                    {
                      class: "fuwari-admonition-view__label-input",
                      value: c.value,
                      "aria-label": "提示块标题",
                      placeholder: "自定义标题",
                      spellcheck: "false",
                      onInput: g,
                      onKeydown:
                        s[0] || (s[0] = n.withModifiers(() => {}, ["stop"])),
                      onMousedown:
                        s[1] || (s[1] = n.withModifiers(() => {}, ["stop"])),
                    },
                    null,
                    40,
                    ot,
                  ),
                ]),
                n.createVNode(n.unref(l.NodeViewContent), {
                  class: "fuwari-admonition-view__content bdm-content",
                }),
              ]),
              _: 1,
            },
            8,
            ["class", "data-fuwari-admonition"],
          )
        );
      },
    }),
    rt = { note: B, tip: $, important: P, warning: O, caution: H },
    at = l.Node.create({
      name: "fuwariAdmonition",
      priority: A,
      group: "block",
      content: "block+",
      defining: !0,
      isolating: !0,
      addAttributes() {
        return {
          type: {
            default: "note",
            parseHTML: (t) => {
              const e = d(t);
              return e ? e.type : void 0;
            },
            renderHTML: (t) => ({ type: h(t.type) }),
          },
          title: {
            default: null,
            parseHTML: (t) => X(t),
            renderHTML: (t) => {
              const e = r(t.title);
              return e ? { "custom-title": e } : {};
            },
          },
        };
      },
      parseHTML() {
        return j;
      },
      renderHTML({ HTMLAttributes: t }) {
        const e = h(t.type),
          o = Y(t),
          { title: i, ...c } = t,
          p = l.mergeAttributes(c, {
            type: e,
            class: `admonition bdm-${e}`,
            "data-fuwari-admonition": e,
            ...(o ? { "custom-title": o } : {}),
          });
        return [
          f,
          p,
          ["span", { class: "bdm-title" }, W(e, o)],
          ["div", { class: "bdm-content" }, 0],
        ];
      },
      addCommands() {
        return {
          insertFuwariAdmonition:
            (t) =>
            ({ commands: e }) =>
              e.insertContent(U(t)),
        };
      },
      addInputRules() {
        return [
          new l.InputRule({
            find: v,
            handler: ({ range: t, commands: e }) => {
              (e.deleteRange(t), e.insertFuwariAdmonition("note"));
            },
          }),
        ];
      },
      addNodeView() {
        return l.VueNodeViewRenderer(it);
      },
      addOptions() {
        return {
          ...this.parent?.(),
          getCommandMenuItems() {
            return a.map((t, e) => ({
              priority: 160 + e,
              icon: n.markRaw(rt[t.type]),
              title: t.commandTitle,
              keywords: t.keywords,
              command: ({ editor: o, range: i }) => {
                o.chain()
                  .focus()
                  .deleteRange(i)
                  .insertFuwariAdmonition(t.type)
                  .run();
              },
            }));
          },
        };
      },
    }),
    ct = Object.freeze(
      Object.defineProperty(
        { __proto__: null, FuwariAdmonition: at },
        Symbol.toStringTag,
        { value: "Module" },
      ),
    );
  return C;
})(HaloUiShared, RichTextEditor, Vue);
