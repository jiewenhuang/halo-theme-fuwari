import {
  getMetaValue,
  getPhotoData,
  t,
  type PhotoGalleryItemData,
} from "./gallery-data";

function createActionLink({
  className = "",
  href,
  iconClass,
  label,
  onClick,
  target,
}: {
  className?: string;
  href: string;
  iconClass: string;
  label: string;
  onClick?: (event: MouseEvent) => void;
  target?: "_blank";
}) {
  const link = document.createElement("a");
  link.className = `pswp-photo-action ${className}`.trim();
  link.href = href;
  link.setAttribute("aria-label", label);
  if (target) {
    link.target = target;
    link.rel = "noopener";
  }
  link.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  if (onClick) {
    link.addEventListener("click", onClick);
  }

  const iconEl = document.createElement("span");
  iconEl.className = `pswp-photo-action__icon ${iconClass}`;
  const labelEl = document.createElement("span");
  labelEl.className = "pswp-photo-action__label";
  labelEl.textContent = label;
  link.append(iconEl, labelEl);
  return link;
}

function createShareAction({
  href,
  label,
  title,
}: {
  href: string;
  label: string;
  title: string;
}) {
  return createActionLink({
    href,
    iconClass: "icon-[material-symbols--ios-share-rounded]",
    label,
    onClick: (event) => {
      event.preventDefault();
      const shareUrl = new URL(href, window.location.href).href;
      if (navigator.share) {
        void navigator.share({ title, url: shareUrl });
        return;
      }
      void navigator.clipboard?.writeText(shareUrl);
    },
  });
}

function createInfoRow({
  iconClass,
  subtitle,
  title,
}: {
  iconClass: string;
  subtitle?: string;
  title: string;
}) {
  const row = document.createElement("div");
  row.className = "pswp-photo-info__detail-row";

  const icon = document.createElement("span");
  icon.className = `pswp-photo-info__detail-icon ${iconClass}`;

  const body = document.createElement("div");
  body.className = "pswp-photo-info__detail-body";

  const titleEl = document.createElement("div");
  titleEl.className = "pswp-photo-info__detail-title";
  titleEl.textContent = title;
  body.append(titleEl);

  if (subtitle) {
    const subtitleEl = document.createElement("div");
    subtitleEl.className = "pswp-photo-info__detail-subtitle";
    subtitleEl.textContent = subtitle;
    body.append(subtitleEl);
  }

  row.append(icon, body);
  return row;
}

function getPanelValues(data: PhotoGalleryItemData) {
  const dimensions = getMetaValue(
    data,
    "page.photos.exif.dimensions",
    "Dimensions",
  );
  const camera =
    data.camera || getMetaValue(data, "page.photos.exif.camera", "Camera");
  const lens = getMetaValue(data, "page.photos.exif.lens", "Lens");
  const aperture = getMetaValue(data, "page.photos.exif.aperture", "Aperture");
  const shutter = getMetaValue(data, "page.photos.exif.shutter", "Shutter");
  const iso = getMetaValue(data, "page.photos.exif.iso", "ISO");
  const focalLength = getMetaValue(
    data,
    "page.photos.exif.focalLength",
    "Focal length",
  );

  return {
    dimensions,
    camera,
    lens,
    cameraSummary: [focalLength, aperture, shutter, iso]
      .filter(Boolean)
      .join(" / "),
    tagTitle: data.tags.join(" / "),
    description:
      data.description || t("page.photos.addDescription", "Add description..."),
  };
}

export function renderPhotoGalleryInfo(
  infoPanel: HTMLElement,
  item: HTMLElement | undefined,
  onDetailClick?: () => void,
) {
  if (!item) return;

  const data = getPhotoData(item);
  const title = data.title || item.getAttribute("aria-label") || "";
  const { dimensions, camera, lens, cameraSummary, tagTitle, description } =
    getPanelValues(data);

  infoPanel.replaceChildren();

  const top = document.createElement("div");
  top.className = "pswp-photo-info__top";

  const titleWrap = document.createElement("div");
  titleWrap.className = "pswp-photo-info__title-wrap";

  const heading = document.createElement("h2");
  heading.className = "pswp-photo-info__title";
  heading.textContent = title;

  const summary = document.createElement("div");
  summary.className = "pswp-photo-info__summary";
  summary.textContent = [dimensions, data.date].filter(Boolean).join("  ");

  titleWrap.append(heading);
  if (summary.textContent) {
    titleWrap.append(summary);
  }
  top.append(titleWrap);
  infoPanel.append(top);

  const details = document.createElement("div");
  details.className = "pswp-photo-info__details";

  if (data.date) {
    details.append(
      createInfoRow({
        iconClass: "icon-[material-symbols--calendar-month-outline-rounded]",
        title: data.date,
        subtitle: t("page.photos.exif.dateTimeOriginal", "Taken"),
      }),
    );
  }

  if (camera || lens || cameraSummary) {
    details.append(
      createInfoRow({
        iconClass: "icon-[material-symbols--photo-camera-outline-rounded]",
        title: camera || lens || t("page.photos.exif.camera", "Camera"),
        subtitle: [lens, cameraSummary].filter(Boolean).join(" / "),
      }),
    );
  }

  if (tagTitle || description) {
    details.append(
      createInfoRow({
        iconClass: "icon-[material-symbols--sell-outline-rounded]",
        title: tagTitle || t("page.photos.tags", "Tags"),
        subtitle: description,
      }),
    );
  }

  if (details.childElementCount) {
    infoPanel.append(details);
  }

  if (data.detailUrl || data.fullUrl) {
    const actions = document.createElement("div");
    actions.className = "pswp-photo-info__actions";
    const shareUrl = data.detailUrl || data.fullUrl || window.location.href;

    if (data.fullUrl) {
      actions.append(
        createActionLink({
          href: data.fullUrl,
          iconClass: "icon-[material-symbols--download-rounded]",
          label: t("page.photos.download", "Download"),
          target: "_blank",
        }),
      );
    }

    actions.append(
      createShareAction({
        href: shareUrl,
        label: t("page.photos.share", "Share"),
        title,
      }),
    );

    if (data.detailUrl) {
      actions.append(
        createActionLink({
          href: data.detailUrl,
          iconClass: "icon-[material-symbols--open-in-new-rounded]",
          label: t("page.photos.viewDetail", "View details"),
          onClick: onDetailClick,
        }),
      );
    }

    actions.append(
      createActionLink({
        className: "pswp-photo-action--ghost",
        href: data.groupUrl || data.detailUrl || data.fullUrl || "#",
        iconClass: "icon-[material-symbols--more-horiz]",
        label: t("page.photos.more", "More"),
        onClick: data.detailUrl && !data.groupUrl ? onDetailClick : undefined,
      }),
    );

    infoPanel.append(actions);
  }
}

export function isolatePhotoInfoEvents(infoPanel: HTMLElement) {
  const stopPropagation = (event: Event) => {
    event.stopPropagation();
  };

  infoPanel.addEventListener("wheel", stopPropagation);
  infoPanel.addEventListener("touchmove", stopPropagation);
}
