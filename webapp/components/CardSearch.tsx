"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { CardMeta } from "@/lib/types";
import {
  DOMAINS,
  PUBLICATION_TYPES,
  domainLabel,
  publicationTypeLabel,
} from "@/lib/types";
import { useLang } from "@/lib/i18n";
import CardListItem from "./CardListItem";

export default function CardSearch({ cards }: { cards: CardMeta[] }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [publicationType, setPublicationType] = useState("");
  const [year, setYear] = useState("");
  const [venue, setVenue] = useState("");
  const [tag, setTag] = useState("");
  const [ratingState, setRatingState] = useState("");
  const [minimumWeight, setMinimumWeight] = useState("");
  const [uploader, setUploader] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(cards, {
        keys: [
          "title",
          "tags",
          "authors",
          "summary",
          "abstract",
          "citation_key",
          "doi",
          "venue",
          "domain",
          "publication_type",
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [cards],
  );

  const results = useMemo(() => {
    let base = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : cards;
    if (domain) base = base.filter((c) => c.domain === domain);
    if (publicationType) base = base.filter((c) => c.publication_type === publicationType);
    if (year) base = base.filter((c) => String(c.year || "") === year);
    if (venue) base = base.filter((c) => c.venue === venue);
    if (tag) base = base.filter((c) => c.tags.includes(tag));
    if (ratingState === "rated") base = base.filter((c) => Boolean(c.rating));
    if (ratingState === "unrated") base = base.filter((c) => !c.rating);
    if (minimumWeight) base = base.filter((c) => (c.rating?.weight || 0) >= Number(minimumWeight));
    if (uploader) base = base.filter((c) => c.uploaded_by === uploader);
    return base;
  }, [
    query,
    domain,
    publicationType,
    year,
    venue,
    tag,
    ratingState,
    minimumWeight,
    uploader,
    cards,
    fuse,
  ]);

  // Group by domain (domains in the canonical order, unknown last).
  const grouped = useMemo(() => {
    const order = [...DOMAINS, ""];
    const byDomain = new Map<string, CardMeta[]>();
    for (const c of results) {
      const d = DOMAINS.includes(c.domain) ? c.domain : "";
      if (!byDomain.has(d)) byDomain.set(d, []);
      byDomain.get(d)!.push(c);
    }
    return order.filter((d) => byDomain.has(d)).map((d) => ({ domain: d, items: byDomain.get(d)! }));
  }, [results]);

  // Domains present in the data, for the filter dropdown.
  const presentDomains = useMemo(
    () => DOMAINS.filter((d) => cards.some((c) => c.domain === d)),
    [cards],
  );
  const presentPublicationTypes = useMemo(
    () => PUBLICATION_TYPES.filter((item) => cards.some((card) => card.publication_type === item)),
    [cards],
  );
  const years = useMemo(
    () => [...new Set(cards.map((card) => card.year).filter(Boolean) as number[])].sort((a, b) => b - a),
    [cards],
  );
  const venues = useMemo(
    () => [...new Set(cards.map((card) => card.venue).filter(Boolean))].sort(),
    [cards],
  );
  const uploaders = useMemo(
    () => [...new Set(cards.map((card) => card.uploaded_by).filter(Boolean))].sort(),
    [cards],
  );
  const tags = useMemo(
    () => [...new Set(cards.flatMap((card) => card.tags))].sort(),
    [cards],
  );

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          placeholder={t("cards.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="">{t("cards.allDomains")}</option>
          {presentDomains.map((d) => (
            <option key={d} value={d}>
              {domainLabel(d)}
            </option>
          ))}
        </select>
        <select value={publicationType} onChange={(event) => setPublicationType(event.target.value)}>
          <option value="">{t("cards.allPublicationTypes")}</option>
          {presentPublicationTypes.map((item) => (
            <option key={item} value={item}>{publicationTypeLabel(item)}</option>
          ))}
        </select>
        <select value={year} onChange={(event) => setYear(event.target.value)}>
          <option value="">{t("cards.allYears")}</option>
          {years.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={venue} onChange={(event) => setVenue(event.target.value)}>
          <option value="">{t("cards.allVenues")}</option>
          {venues.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={tag} onChange={(event) => setTag(event.target.value)}>
          <option value="">{t("cards.allTags")}</option>
          {tags.map((item) => <option key={item} value={item}>#{item}</option>)}
        </select>
        <select value={ratingState} onChange={(event) => setRatingState(event.target.value)}>
          <option value="">{t("cards.anyRating")}</option>
          <option value="rated">{t("cards.rated")}</option>
          <option value="unrated">{t("cards.unrated")}</option>
        </select>
        <select value={minimumWeight} onChange={(event) => setMinimumWeight(event.target.value)}>
          <option value="">{t("cards.anyWeight")}</option>
          {[80, 60, 40].map((item) => (
            <option key={item} value={item}>{t("cards.weightAtLeast")} {item}</option>
          ))}
        </select>
        <select value={uploader} onChange={(event) => setUploader(event.target.value)}>
          <option value="">{t("cards.allUploaders")}</option>
          {uploaders.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <p className="subtitle" style={{ marginBottom: 12 }}>
        {results.length} / {cards.length} {t("cards.unit")}
      </p>
      {grouped.map((g) => (
        <section key={g.domain || "unsorted"} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>
            {domainLabel(g.domain)} <span className="subtitle" style={{ fontSize: 13 }}>· {g.items.length}</span>
          </h2>
          <div className="card-grid">
            {g.items.map((c) => (
              <CardListItem key={c.slug} card={c} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
