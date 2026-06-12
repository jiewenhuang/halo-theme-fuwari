<script lang="ts" setup>
import {
  NodeViewContent,
  NodeViewWrapper,
  nodeViewProps,
} from "@halo-dev/richtext-editor";
import { computed } from "vue";

import {
  getEditableAdmonitionTitle,
  getAdmonition,
  normalizeAdmonitionTitle,
  normalizeAdmonitionType,
  type AdmonitionType,
} from "./constants";

const props = defineProps(nodeViewProps);

const type = computed(
  () => normalizeAdmonitionType(props.node.attrs.type) as AdmonitionType,
);
const admonition = computed(() => getAdmonition(type.value));
const title = computed(() =>
  getEditableAdmonitionTitle(props.node.attrs.title),
);
const hasCustomTitle = computed(() => Boolean(title.value));

function handleTitleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  const customTitle = normalizeAdmonitionTitle(value);

  props.updateAttributes({
    title: customTitle ?? null,
  });
}
</script>

<template>
  <NodeViewWrapper
    as="div"
    :class="['fuwari-admonition-view', 'admonition', `bdm-${admonition.type}`]"
    :data-fuwari-admonition="admonition.type"
  >
    <div class="fuwari-admonition-view__title" contenteditable="false">
      <span v-if="!hasCustomTitle" class="fuwari-admonition-view__marker">
        {{ admonition.marker }}
      </span>
      <input
        class="fuwari-admonition-view__label-input"
        :value="title"
        aria-label="提示块标题"
        placeholder="自定义标题"
        spellcheck="false"
        @input="handleTitleInput"
        @keydown.stop
        @mousedown.stop
      />
    </div>
    <NodeViewContent class="fuwari-admonition-view__content bdm-content" />
  </NodeViewWrapper>
</template>
