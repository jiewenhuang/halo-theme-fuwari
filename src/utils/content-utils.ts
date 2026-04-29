export type Tag = {
  name: string;
  count: number;
};

export type Category = {
  name: string;
  count: number;
  url: string;
};

export function getHaloRuntimeOnlyMessage() {
  return "Content is provided by Halo at Thymeleaf runtime.";
}
