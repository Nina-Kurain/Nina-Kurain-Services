"use client";

import React, { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

export type UrlObject = {
  pathname?: string;
  search?: string;
  hash?: string;
  query?: Record<string, string | number | boolean | readonly (string | number | boolean)[] | undefined>;
};

export interface SiteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string | UrlObject;
  as?: string;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  prefetch?: boolean;
  locale?: string | false;
  children?: ReactNode;
}

export const SiteLink = forwardRef<HTMLAnchorElement, SiteLinkProps>(function SiteLink(
  { href, as, replace, scroll, shallow, passHref, prefetch, locale, onClick, children, ...rest },
  ref
) {
  let url = "";
  if (typeof href === "string") {
    url = href;
  } else if (href && typeof href === "object") {
    url = href.pathname || "/";
    if (href.search) {
      url += href.search;
    }
    if (href.hash) {
      url += href.hash;
    }
  }

  return (
    <a
      ref={ref}
      href={url}
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        }
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export default SiteLink;
