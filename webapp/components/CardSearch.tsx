"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { CardMeta } from "@/lib/types";
import { DOMAINS, cardMatchesDomain, domainLabel } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import CardListItem from "./CardListItem";

type TimeRange = "" | "last-2" | "last-3" | "last-5" | "before-2020";

export default function CardSearch({ cards }: { cards: CardMeta[] }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("");

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
          "primary_domain",
          "domains",
          "publication_type",
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [cards],
  );

  const results = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let base = query.trim() ? fuse.search(query.trim()).map((result) => result.item) : cards;
    if (domain) base = base.filter((card) => cardMatchesDomain(card, domain));
    if (timeRange === "last-2") {
      base = base.filter((card) => Boolean(card.year && card.year >= currentYear - 1));
    } else if (timeRange === "last-3") {
      base = base.filter((card) => Boolean(card.year && card.year >= currentYear - 2));
    } else if (timeRange === "last-5") {
      base = base.filter((card) => Boolean(card.year && card.year >= currentYear - 4));
    } else if (timeRange === "before-2020") {
      base = base.filter((card) => Boolean(card.year && card.year < 2020));
    }
    return base;
  }, [query, domain, timeRange, cards, fuse]);

  const grouped = useMemo(() => {
    const order = [...DOMAINS, ""];
    const byDomain = new Map<string, CardMeta[]>();
    for (const card of results) {
      const primary = DOMAINS.includes(card.primary_domain) ? card.primary_domain : "";
      if (!byDomain.has(primary)) byDomain.set(primary, []);
      byDomain.get(primary)!.push(card);
    }
    return order
      .filter((item) => byDomain.has(item))
      .map((item) => ({ domain: item, items: byDomain.get(item)! }));
  }, [results]);

  const presentDomains = useMemo(
    () => DOMAINS.filter((item) => cards.some((card) => cardMatchesDomain(card, item))),
    [cards],
  );

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          placeholder={t("cards.search")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={domain} onChange={(event) => setDomain(event.target.value)}>
          <option value="">{t("cards.allDomains")}</option>
          {presentDomains.map((item) => (
            <option key={item} value={item}>{domainLabel(item)}</option>
          ))}
        </select>
        <select
          value={timeRange}
          onChange={(event) => setTimeRange(event.target.value as TimeRange)}
        >
          <option value="">{t("cards.anyTime")}</option>
          <option value="last-2">{t("cards.last2Years")}</option>
          <option value="last-3">{t("cards.last3Years")}</option>
          <option value="last-5">{t("cards.last5Years")}</option>
          <option value="before-2020">{t("cards.before2020")}</option>
        </select>
      </div>
      <p className="subtitle" style={{ marginBottom: 12 }}>
        {results.length} / {cards.length} {t("cards.unit")}
      </p>
      {grouped.map((group) => (
        <section key={group.domain || "unsorted"} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>
            {domainLabel(group.domain)}{" "}
            <span className="subtitle" style={{ fontSize: 13 }}>· {group.items.length}</span>
          </h2>
          <div className="card-grid">
            {group.items.map((card) => <CardListItem key={card.slug} card={card} />)}
          </div>
        </section>
      ))}
    </>
  );
}
