export interface PhotoGalleryMetaItem {
  label: string;
  value: string;
}

export interface PhotoGalleryItemData {
  coverUrl: string;
  detailUrl: string;
  fullUrl: string;
  groupName: string;
  groupUrl: string;
  title: string;
  description: string;
  date: string;
  camera: string;
  tags: string[];
  meta: PhotoGalleryMetaItem[];
}

export function textFrom(element: Element | null) {
  return element?.textContent?.trim() || "";
}

export function t(key: string, fallback: string) {
  const value = window.i18nResources?.[key];
  return value && !value.includes("#{") ? value : fallback;
}

export function cssImageUrl(url: string) {
  return url ? `url("${url.replace(/["\\]/g, "\\$&")}")` : "none";
}

export function getPhotoData(item: HTMLElement): PhotoGalleryItemData {
  const cover = item.querySelector<HTMLImageElement>(".photo-cover");

  return {
    coverUrl: cover?.currentSrc || cover?.src || "",
    detailUrl: textFrom(item.querySelector(".photo-detail-url")),
    fullUrl: textFrom(item.querySelector(".photo-full-url")),
    groupName: textFrom(item.querySelector(".photo-group-name")),
    groupUrl: textFrom(item.querySelector(".photo-group-url")),
    title: textFrom(item.querySelector(".photo-data-title")),
    description: textFrom(item.querySelector(".photo-data-description")),
    date: textFrom(item.querySelector(".photo-data-date")),
    camera: textFrom(item.querySelector(".photo-data-camera")),
    tags: Array.from(item.querySelectorAll(".photo-data-tag")).map(textFrom),
    meta: Array.from(item.querySelectorAll(".photo-meta-item"))
      .map((metaItem) => ({
        label: textFrom(metaItem.querySelector(".photo-meta-label")),
        value: textFrom(metaItem.querySelector(".photo-meta-value")),
      }))
      .filter((metaItem) => metaItem.label && metaItem.value),
  };
}

export function getMetaValue(
  data: PhotoGalleryItemData,
  key: string,
  fallback: string,
) {
  const label = t(key, fallback);
  return (
    data.meta.find((metaItem) => metaItem.label.includes(label))?.value || ""
  );
}

export function getPhotoGalleryItems() {
  return Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      "#photos-gallery .photo-gallery-link",
    ),
  );
}
