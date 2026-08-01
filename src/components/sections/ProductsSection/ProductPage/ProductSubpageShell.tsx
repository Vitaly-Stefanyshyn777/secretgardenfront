"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./ProductSubpage.module.css";

interface ProductSubpageShellProps {
  title: string;
  backHref: string;
  children: React.ReactNode;
}

export default function ProductSubpageShell({
  title,
  backHref,
  children,
}: ProductSubpageShellProps) {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push(backHref);
            }
          }}
          aria-label="Назад"
        >
          <svg viewBox="0 0 28 28" fill="none" aria-hidden>
            <path
              d="M17.5 7L10.5 14L17.5 21"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.headerSpacer} aria-hidden />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export function ProductSubpageLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
