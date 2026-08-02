"use client";

import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, TelegramIcon } from "@/components/Icons/Icons";
import type {
  ContentAboutBlock,
  ContentContacts,
} from "@/lib/contentApi";
import s from "./AboutSection.module.css";

type Props = {
  blocks: ContentAboutBlock[];
  contacts?: ContentContacts | null;
};

function paragraphs(body: string) {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function resolveCtaUrl(
  block: ContentAboutBlock,
  contacts?: ContentContacts | null,
) {
  if (block.ctaUrl) return block.ctaUrl;
  const label = (block.ctaLabel || "").toLowerCase();
  if (label.includes("сертиф")) {
    return contacts?.certificateUrl || undefined;
  }
  if (label.includes("збір") || label.includes("підтрим")) {
    return contacts?.donationUrl || undefined;
  }
  return contacts?.donationUrl || contacts?.certificateUrl || undefined;
}

function isSupportBlock(block: ContentAboutBlock) {
  const title = block.title.toLowerCase();
  const label = (block.ctaLabel || "").toLowerCase();
  return (
    title.includes("підтрим") ||
    label.includes("збір") ||
    label.includes("підтрим")
  );
}

function CtaLink({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {children}
    </button>
  );
}

const AboutSection = ({ blocks, contacts }: Props) => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        {blocks.map((block, index) => {
          const texts = paragraphs(block.body);
          const links = Array.isArray(block.links) ? block.links : [];
          const imageLeft = block.imageLeft ?? index % 2 === 0;
          const ctaHref = resolveCtaUrl(block, contacts);
          const support = isSupportBlock(block);
          // як у fallback «Наша політика»: фото зліва, кнопка під фото
          const policyLayout = Boolean(
            imageLeft && block.ctaLabel && !support,
          );

          const media = block.imageUrl ? (
            <div className={s.mediaBlock}>
              <Image
                src={block.imageUrl}
                alt={block.title}
                width={support ? 549 : 541}
                height={support ? 257 : 318}
                className={s.image}
                unoptimized={block.imageUrl.startsWith("http")}
              />
            </div>
          ) : null;

          const underImageCta =
            policyLayout && block.ctaLabel ? (
              <CtaLink href={ctaHref} className={s.actionButton}>
                {block.ctaLabel}
              </CtaLink>
            ) : null;

          const supportCta =
            support && block.ctaLabel ? (
              <CtaLink href={ctaHref} className={s.supportButton}>
                <span className={s.supportButtonExtra}>+</span>
                <span>{block.ctaLabel}</span>
                <span className={s.supportButtonExtra}>+</span>
              </CtaLink>
            ) : null;

          const content = (
            <div className={s.contentBlock}>
              <h2 className={s.title}>{block.title}</h2>
              <div className={s.textGroup}>
                {texts.map((text, i) => (
                  <p key={i} className={s.text}>
                    {text.split("\n").map((line, li) => (
                      <span key={li}>
                        {li > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </p>
                ))}
              </div>

              {links.length > 0 ? (
                <div className={s.socialButtons}>
                  {links.map((link) => (
                    <Link
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={s.socialButton}
                    >
                      {link.kind === "instagram" ||
                      link.label.toLowerCase().includes("instagram") ? (
                        <InstagramIcon />
                      ) : null}
                      {link.kind === "telegram" ||
                      link.label.toLowerCase().includes("telegram") ? (
                        <TelegramIcon />
                      ) : null}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              ) : null}

              {supportCta}
            </div>
          );

          return (
            <div
              key={block.id}
              className={`${s.block} ${policyLayout ? s.blockPolicy : ""} ${
                support ? s.blockSupport : ""
              }`}
            >
              {policyLayout ? (
                <>
                  {media}
                  {content}
                  {underImageCta}
                </>
              ) : imageLeft ? (
                <>
                  {media}
                  {content}
                </>
              ) : (
                <>
                  {content}
                  {media}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutSection;
