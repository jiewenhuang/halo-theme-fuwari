import PhotoSwipeLightbox from "photoswipe/lightbox";

export function initContentPhotoSwipe() {
  const pswp = import("photoswipe");
  const lightbox = new PhotoSwipeLightbox({
    gallery:
      ".custom-md img, #post-cover img, .moment-media img, #photo-detail-image",
    pswpModule: () => pswp,
    padding: { top: 20, bottom: 20, left: 20, right: 20 },
    wheelToZoom: true,
    arrowPrev: false,
    arrowNext: false,
    imageClickAction: "close",
    tapAction: "close",
    doubleTapAction: "zoom",
  });

  lightbox.addFilter("domItemData", (itemData, element) => {
    if (element instanceof HTMLImageElement) {
      const src = element.dataset.pswpSrc || element.src;
      const dataWidth = Number(element.dataset.pswpWidth || 0);
      const dataHeight = Number(element.dataset.pswpHeight || 0);
      const width = dataWidth || element.naturalWidth || window.innerWidth;
      const height = dataHeight || element.naturalHeight || window.innerHeight;
      itemData.src = src;
      itemData.width = width;
      itemData.height = height;
      itemData.w = width;
      itemData.h = height;
      itemData.msrc = element.src;
    } else if (element instanceof HTMLAnchorElement) {
      const src = element.dataset.pswpSrc || element.href;
      itemData.src = src;
      itemData.w = Number(element.dataset.pswpWidth || window.innerWidth);
      itemData.h = Number(element.dataset.pswpHeight || window.innerHeight);
    }
    return itemData;
  });

  lightbox.init();
  return lightbox;
}
