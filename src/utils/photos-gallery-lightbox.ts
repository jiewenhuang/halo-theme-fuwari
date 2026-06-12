import PhotoSwipeLightbox from "photoswipe/lightbox";
import {
  cssImageUrl,
  getPhotoData,
  getPhotoGalleryItems,
  t,
  textFrom,
} from "./photos/gallery-data";
import {
  isolatePhotoInfoEvents,
  renderPhotoGalleryInfo,
} from "./photos/gallery-info-panel";

function lockPageScroll() {
  const scrollY = window.scrollY;
  const bodyStyles = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
  };
  const htmlOverflow = document.documentElement.style.overflow;

  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";

  return () => {
    document.documentElement.style.overflow = htmlOverflow;
    document.body.style.overflow = bodyStyles.overflow;
    document.body.style.position = bodyStyles.position;
    document.body.style.top = bodyStyles.top;
    document.body.style.width = bodyStyles.width;
    window.scrollTo(0, scrollY);
  };
}

export function initPhotosGalleryLightbox() {
  const gallery = document.getElementById("photos-gallery");
  if (!gallery) return;

  const pswp = import("photoswipe");
  const lightbox = new PhotoSwipeLightbox({
    gallery: "#photos-gallery",
    children: ".photo-gallery-link",
    pswpModule: () => pswp,
    mainClass: "pswp--photos-gallery",
    paddingFn: (viewportSize: { x: number; y: number }) => {
      if (viewportSize.x >= 1024) {
        return { top: 32, right: 464, bottom: 148, left: 32 };
      }
      return { top: 72, right: 16, bottom: 220, left: 16 };
    },
    initialZoomLevel: "fit",
    secondaryZoomLevel: "fit",
    maxZoomLevel: 2,
    loop: false,
    showHideAnimationType: "none",
    showAnimationDuration: 0,
    hideAnimationDuration: 0,
    wheelToZoom: true,
    bgClickAction: "close",
    imageClickAction: false,
    tapAction: false,
    doubleTapAction: false,
    escKey: true,
    arrowKeys: true,
  });
  let unlockPageScroll: (() => void) | undefined;

  lightbox.on("beforeOpen", () => {
    unlockPageScroll = lockPageScroll();
  });

  lightbox.on("destroy", () => {
    unlockPageScroll?.();
    unlockPageScroll = undefined;
  });

  lightbox.addFilter("domItemData", (itemData, element) => {
    const link =
      element instanceof HTMLAnchorElement
        ? element
        : element.querySelector<HTMLAnchorElement>("a");
    const img = element.querySelector<HTMLImageElement>("img");
    if (!link) return itemData;

    itemData.src = link.dataset.pswpSrc || link.href;
    const dataWidth = Number(link.dataset.pswpWidth || 0);
    const dataHeight = Number(link.dataset.pswpHeight || 0);
    const naturalWidth = img?.naturalWidth || 0;
    const naturalHeight = img?.naturalHeight || 0;
    itemData.w = dataWidth || naturalWidth || window.innerWidth;
    itemData.h =
      dataHeight || naturalHeight || itemData.w || window.innerHeight;
    itemData.msrc = img?.currentSrc || img?.src;
    itemData.alt =
      img?.alt || textFrom(link.querySelector(".photo-data-title"));
    return itemData;
  });

  lightbox.on("uiRegister", () => {
    const pswpInstance = lightbox.pswp;
    if (!pswpInstance) return;

    let infoPanel: HTMLElement | undefined;
    let thumbRail: HTMLElement | undefined;

    const updateChrome = () => {
      const items = getPhotoGalleryItems();
      const currentItem = items[pswpInstance.currIndex];
      const currentData = currentItem ? getPhotoData(currentItem) : undefined;
      pswpInstance.element?.style.setProperty(
        "--photos-current-image",
        cssImageUrl(currentData?.coverUrl || currentData?.fullUrl || ""),
      );

      if (infoPanel) {
        renderPhotoGalleryInfo(infoPanel, currentItem, () =>
          pswpInstance.close(),
        );
      }

      if (thumbRail) {
        Array.from(
          thumbRail.querySelectorAll<HTMLButtonElement>(".pswp-photo-thumb"),
        ).forEach((thumb, thumbIndex) => {
          const active = thumbIndex === pswpInstance.currIndex;
          thumb.classList.toggle("is-active", active);
          thumb.setAttribute("aria-pressed", String(active));
          if (active) {
            const railInner = thumb.parentElement;
            if (railInner) {
              railInner.scrollLeft =
                thumb.offsetLeft -
                (railInner.clientWidth - thumb.clientWidth) / 2;
            }
          }
        });
      }
    };

    pswpInstance.ui?.registerElement({
      name: "photoInfo",
      appendTo: "root",
      className: "pswp-photo-info",
      onInit: (element) => {
        infoPanel = element;
        isolatePhotoInfoEvents(element);
        updateChrome();
      },
    });

    pswpInstance.ui?.registerElement({
      name: "photoThumbRail",
      appendTo: "root",
      className: "pswp-photo-rail",
      onInit: (element) => {
        thumbRail = element;
        const items = getPhotoGalleryItems();
        const railInner = document.createElement("div");
        railInner.className = "pswp-photo-rail__inner";

        items.forEach((item, itemIndex) => {
          const data = getPhotoData(item);
          const button = document.createElement("button");
          button.type = "button";
          button.className = "pswp-photo-thumb";
          button.setAttribute(
            "aria-label",
            `${t("page.photos.selectPhoto", "Select photo")} ${itemIndex + 1}`,
          );
          button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            pswpInstance.goTo(itemIndex);
          });

          const img = document.createElement("img");
          img.src = data.coverUrl;
          img.alt = data.title;
          img.loading = "lazy";
          button.append(img);
          railInner.append(button);
        });

        element.replaceChildren(railInner);
        updateChrome();
      },
    });

    pswpInstance.on("change", updateChrome);
  });

  lightbox.init();
  return lightbox;
}
