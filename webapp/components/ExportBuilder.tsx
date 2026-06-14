"use client";

import { useMemo, useState } from "react";
import type { Card } from "@/lib/types";
import {
  DOMAINS,
  PUBLICATION_TYPES,
  domainLabel,
  publicationTypeLabel,
} from "@/lib/types";
import { bundlePrompt, driveDownloadUrl, estimateTokens, matchCardsFromText } from "@/lib/export";
import { useLang } from "@/lib/i18n";
import CopyButton from "./CopyButton";
import DownloadButton from "./DownloadButton";

export default function ExportBuilder({ cards, repo }: { cards: Card[]; repo?: string }) {
  const { t } = useLang();
  const [domain, setDomain] = useState("");
  const [publicationType, setPublicationType] = useState("");
  const [listText, setListText] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return cards.filter(
      (c) =>
        (!domain || c.domain === domain) &&
        (!publicationType || c.publication_type === publicationType) &&
        (!f || c.title.toLowerCase().includes(f) || c.tags.some((tag) => tag.includes(f))),
    );
  }, [cards, domain, publicationType, filter]);

  const presentDomains = useMemo(
    () => DOMAINS.filter((item) => cards.some((card) => card.domain === item)),
    [cards],
  );
  const presentPublicationTypes = useMemo(
    () => PUBLICATION_TYPES.filter((item) => cards.some((card) => card.publication_type === item)),
    [cards],
  );

  const chosen = cards.filter((c) => selected.has(c.slug));
  const bundle = useMemo(() => (chosen.length ? bundlePrompt(chosen, repo) : ""), [chosen, repo]);
  const tokens = useMemo(() => (bundle ? estimateTokens(bundle) : 0), [bundle]);

  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
  };

  const download = () => {
    const blob = new Blob([bundle], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kb-bundle-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const matched = useMemo(
    () => (listText.trim() ? matchCardsFromText(cards, listText) : []),
    [listText, cards],
  );
  const matchedLinks = matched
    .filter((c) => c.drive.length)
    .map((c) => driveDownloadUrl(c.drive[0]))
    .join("\n");

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          placeholder={t("export.filter")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="">{t("export.allDomains")}</option>
          {presentDomains.map((item) => (
            <option key={item} value={item}>{domainLabel(item)}</option>
          ))}
        </select>
        <select value={publicationType} onChange={(event) => setPublicationType(event.target.value)}>
          <option value="">{t("cards.allPublicationTypes")}</option>
          {presentPublicationTypes.map((item) => (
            <option key={item} value={item}>{publicationTypeLabel(item)}</option>
          ))}
        </select>
        <button className="btn" onClick={() => setSelected(new Set([...selected, ...visible.map((c) => c.slug)]))}>
          {t("export.selectAll")}
        </button>
        <button className="btn" onClick={() => setSelected(new Set())}>{t("export.clear")}</button>
      </div>

      <div className="card-grid" style={{ marginBottom: 20 }}>
        {visible.map((c) => (
          <label key={c.slug} className="card-item" style={{ display: "flex", gap: 12, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selected.has(c.slug)}
              onChange={() => toggle(c.slug)}
              style={{ width: "auto", marginTop: 4 }}
            />
            <span>
              <span className="titles">{c.title}</span>
              <span className="meta-row">
                <span className="badge domain">{domainLabel(c.domain)}</span>
                {c.publication_type && (
                  <span className="badge type">{publicationTypeLabel(c.publication_type)}</span>
                )}
                {c.drive.length > 0 && <span className="badge">{t("export.hasFulltext")}</span>}
                {c.comments.length > 0 && <span className="badge">{c.comments.length} {t("comments.count")}</span>}
                {c.tags.map((tag) => (
                  <span key={tag} className="badge">#{tag}</span>
                ))}
              </span>
            </span>
          </label>
        ))}
      </div>

      {chosen.length > 0 && (
        <div className="form-card">
          <b>
            {chosen.length} {t("export.selected")} · ~{tokens.toLocaleString()} tokens
          </b>
          <p className="subtitle" style={{ margin: "6px 0 12px" }}>
            {t("export.hint")}
          </p>
          <div className="btn-row" style={{ marginTop: 0 }}>
            <CopyButton text={bundle} label={t("export.copy")} primary />
            <button className="btn" onClick={download}>{t("export.download")}</button>
          </div>
          <label style={{ marginTop: 14 }}>{t("export.preview")}</label>
          <textarea rows={12} readOnly value={bundle} />
        </div>
      )}

      <h2 style={{ marginTop: 36 }}>{t("get.title")}</h2>
      <p className="subtitle">{t("get.subtitle")}</p>
      <div className="form-card">
        <textarea
          rows={5}
          placeholder={t("get.placeholder")}
          value={listText}
          onChange={(e) => setListText(e.target.value)}
        />
        {listText.trim() && (
          <>
            <p className="subtitle" style={{ margin: "12px 0 8px" }}>
              {matched.length} {t("get.matched")}
            </p>
            <div className="card-grid">
              {matched.map((c) => (
                <div key={c.slug} className="card-item" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <span>
                    <span className="titles">{c.title}</span>
                    <span className="cite">{c.citation_key || c.slug}</span>
                  </span>
                  {c.drive.length > 0 ? (
                    <DownloadButton link={c.drive[0]} />
                  ) : (
                    <span className="badge">{t("get.noPdf")}</span>
                  )}
                </div>
              ))}
            </div>
            {matchedLinks && (
              <div className="btn-row">
                <CopyButton text={matchedLinks} label={t("get.copyLinks")} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
