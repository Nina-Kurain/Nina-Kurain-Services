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

  // If on VIP host and clicking logo or root link, redirect to main site
  let resolvedHref = url;
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.startsWith("vip.") && (url === "/" || rest.className?.includes("wordmark"))) {
      resolvedHref = "https://ninakurainservices.in";
    }
  }

  return (
    <a
      ref={ref}
      href={resolvedHref}
      onClick={(e) => {
        if (typeof window !== "undefined") {
          const host = window.location.hostname.toLowerCase();
          if (host.startsWith("vip.") && (url === "/" || rest.className?.includes("wordmark"))) {
            e.preventDefault();
            window.location.href = "https://ninakurainservices.in";
            return;
          }
        }
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
