import Link from "next/link";
import type { CardMeta } from "@/lib/types";
import { domainLabel, publicationTypeLabel } from "@/lib/types";
import DownloadButton from "./DownloadButton";

export default function CardListItem({ card }: { card: CardMeta }) {
  const cite = [card.authors[0], card.year].filter(Boolean).join(" · ");
  return (
    <Link href={`/cards/${card.slug}`} className="card-item">
      <div className="titles">
        {card.title}
        {card.drive.length > 0 && (
          <span className="dl-slot">
            <DownloadButton link={card.drive[0]} compact />
          </span>
        )}
      </div>
      {cite && <div className="cite">{cite}{card.authors.length > 1 ? " et al." : ""}</div>}
      {card.summary && <div className="excerpt">{card.summary.slice(0, 180)}</div>}
      <div className="meta-row">
        {card.primary_domain && (
          <span className="badge domain">{domainLabel(card.primary_domain)}</span>
        )}
        {card.publication_type && (
          <span className="badge type">{publicationTypeLabel(card.publication_type)}</span>
        )}
        {card.venue && <span className="badge">{card.venue}</span>}
        {card.rating && <span className="badge weight">Weight {card.rating.weight}</span>}
        {card.comments.length > 0 && <span className="badge">Comments {card.comments.length}</span>}
        {card.tags.map((t) => (
          <span key={t} className="badge">#{t}</span>
        ))}
      </div>
    </Link>
  );
}
