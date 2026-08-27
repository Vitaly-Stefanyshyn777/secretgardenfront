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

type ButtonItem = {
  label: string;
  url?: string;
  kind: string;
};

function paragraphs(body: string) {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function resolveTextBlocks(block: ContentAboutBlock) {
  const raw = Array.isArray(block.textBlocks) ? block.textBlocks : [];
  const fromJson = raw
    .map((tb) => ({
      text: String(tb?.text ?? "").trim(),
      gap: Number(tb?.gap ?? 16),
    }))
    .filter((tb) => tb.text.length > 0);
  if (fromJson.length > 0) return fromJson;
  return paragraphs(block.body).map((text) => ({ text, gap: 16 }));
}

function isSocialKind(kind: string, label: string) {
  const k = kind.toLowerCase();
  const l = label.toLowerCase();
  return (
    k === "instagram" ||
    k === "telegram" ||
    l.includes("instagram") ||
    l.includes("telegram")
  );
}

function resolveButtonUrl(
  item: ButtonItem,
  contacts?: ContentContacts | null,
) {
  if (item.url && /^https?:\/\//i.test(item.url)) return item.url;
  if (item.url && (item.url.includes(".") || item.url.startsWith("/"))) {
    return item.url;
  }

  const label = item.label.toLowerCase();
  const kind = item.kind.toLowerCase();

  if (kind === "instagram" || label.includes("instagram")) {
    return contacts?.instagramUrl || item.url || undefined;
  }
  if (kind === "telegram" || label.includes("telegram")) {
    const fromContacts = Array.isArray(contacts?.telegramUrls)
      ? contacts?.telegramUrls[0]
      : undefined;
    return fromContacts || item.url || undefined;
  }
  if (
    kind === "pdf" ||
    label.includes("сертиф") ||
    label.includes("cert")
  ) {
    return contacts?.certificateUrl || item.url || undefined;
  }
  if (
    label.includes("збір") ||
    label.includes("підтрим") ||
    label.includes("support")
  ) {
    return contacts?.donationUrl || item.url || undefined;
  }
  return item.url || contacts?.donationUrl || contacts?.certificateUrl || undefined;
}

function collectButtons(block: ContentAboutBlock): ButtonItem[] {
  const links = Array.isArray(block.links) ? block.links : [];
  const items: ButtonItem[] = links
    .filter((l) => l.label?.trim())
    .map((l) => ({
      label: l.label.trim(),
      url: l.url?.trim() || "",
      kind: (l.kind || "link").toLowerCase(),
    }));

  const ctaLabel = (block.ctaLabel || "").trim();
  const ctaUrl = (block.ctaUrl || "").trim();
  if (!ctaLabel) return items;

  const already = items.some(
    (i) =>
      i.label.toLowerCase() === ctaLabel.toLowerCase() && i.url === ctaUrl,
  );
  if (already) return items;

  // Старий кейс: у URL написали "Telegram" замість лінка
  const looksLikeSecondLabel =
    ctaUrl &&
    !/^https?:\/\//i.test(ctaUrl) &&
    !ctaUrl.includes(".") &&
    ctaUrl.length < 40;

  if (looksLikeSecondLabel) {
    return [
      {
        label: ctaLabel,
        url: "",
        kind: isSocialKind("", ctaLabel) ? ctaLabel.toLowerCase() : "link",
      },
      {
        label: ctaUrl,
        url: "",
        kind: isSocialKind("", ctaUrl) ? ctaUrl.toLowerCase() : "telegram",
      },
      ...items,
    ];
  }

  return [
    {
      label: ctaLabel,
      url: ctaUrl,
      kind:
        ctaUrl.includes(".pdf") || ctaUrl.includes("raw/upload")
          ? "pdf"
          : isSocialKind("", ctaLabel)
            ? ctaLabel.toLowerCase()
            : "link",
    },
    ...items,
  ];
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

function ButtonRow({
  items,
  contacts,
  fullWidth,
  support,
}: {
  items: ButtonItem[];
  contacts?: ContentContacts | null;
  fullWidth?: boolean;
  support?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div
      className={`${s.buttonsRow} ${fullWidth ? s.buttonsRowFull : ""}`}
    >
      {items.map((item) => {
        const social = isSocialKind(item.kind, item.label);
        const href = resolveButtonUrl(item, contacts);
        const className = support
          ? s.supportButton
          : social
            ? s.socialButton
            : s.actionButton;

        return (
          <CtaLink
            key={`${item.label}-${item.url}-${item.kind}`}
            href={href}
            className={className}
          >
            {item.kind === "instagram" ||
            item.label.toLowerCase().includes("instagram") ? (
              <InstagramIcon />
            ) : null}
            {item.kind === "telegram" ||
            item.label.toLowerCase().includes("telegram") ? (
              <TelegramIcon />
            ) : null}
            <span>{item.label}</span>
          </CtaLink>
        );
      })}
    </div>
  );
}

const AboutSection = ({ blocks, contacts }: Props) => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        {blocks.map((block, index) => {
          const textItems = resolveTextBlocks(block);
          const buttons = collectButtons(block);
          const imageLeft = block.imageLeft ?? index % 2 === 0;
          const buttonsLeft =
            block.buttonsLeft === undefined || block.buttonsLeft === null
              ? true
              : Boolean(block.buttonsLeft);
          const support =
            block.title.toLowerCase().includes("підтрим") ||
            block.title.toLowerCase().includes("support") ||
            buttons.some((b) =>
              /збір|підтрим|support|fundrais/i.test(b.label),
            );
          const textPadding = Number(block.textPadding ?? 0);
          const buttonsUnderImage = buttonsLeft === imageLeft;
          const fullWidthButtons =
            buttonsUnderImage && buttons.length === 1;

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

          const buttonsNode = (
            <ButtonRow
              items={buttons}
              contacts={contacts}
              fullWidth={fullWidthButtons}
              support={support && buttons.length === 1}
            />
          );

          const content = (
            <div
              className={s.contentBlock}
              style={
                textPadding > 0
                  ? { padding: textPadding, boxSizing: "border-box" }
                  : undefined
              }
            >
              <h2 className={s.title}>{block.title}</h2>
              <div className={s.textGroup}>
                {textItems.map((item, i) => (
                  <p
                    key={i}
                    className={s.text}
                    style={{
                      marginBottom:
                        i < textItems.length - 1 ? `${item.gap}px` : 0,
                    }}
                  >
                    {item.text.split("\n").map((line, li) => (
                      <span key={li}>
                        {li > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
              {!buttonsUnderImage && buttons.length > 0 ? buttonsNode : null}
            </div>
          );

          const mediaCol = (
            <div className={s.mediaCol}>
              {media}
              {buttonsUnderImage && buttons.length > 0 ? buttonsNode : null}
            </div>
          );

          return (
            <div
              key={block.id}
              className={`${s.block} ${s.blockGrid} ${
                support ? s.blockSupport : ""
              } ${!imageLeft ? s.blockImageRight : ""}`}
            >
              {imageLeft ? (
                <>
                  {mediaCol}
                  {content}
                </>
              ) : (
                <>
                  {content}
                  {mediaCol}
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
