"""Validate literature records, legacy notes, naming, duplicates, and links."""
from __future__ import annotations

import re
import sys

from kblib import (DOMAINS, ENTRY_TYPES, LEGACY_TYPES, OFFICIAL_DIR,
                   PENDING_DIR, PUBLICATION_TYPES, STATUSES, Card, iter_cards,
                   utf8_stdout)

REQUIRED_ALWAYS = ["title", "domain", "status", "tags", "created"]
REQUIRED_LITERATURE = ["entry_type", "publication_type", "citation_key", "authors", "year"]
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
TAG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)")
LITERATURE_SECTIONS = [
    "## Summary",
    "## Problem",
    "## Method",
    "## Key results",
    "## Strengths",
    "## Limitations",
    "## Relevance to our group",
    "## Notes",
    "## References",
]


def main() -> int:
    utf8_stdout()
    cards = iter_cards()
    errors: list[str] = []
    warnings: list[str] = []
    slugs: dict[str, Card] = {}

    for card in cards:
        where = card.rel_path
        if card.parse_error:
            errors.append(f"{where}: {card.parse_error}")
            continue
        meta = card.meta

        if card.slug in slugs:
            errors.append(f"{where}: duplicate slug '{card.slug}' (also {slugs[card.slug].rel_path})")
        else:
            slugs[card.slug] = card

        if not SLUG_RE.match(card.slug):
            errors.append(f"{where}: file name must be lowercase kebab-case")

        for key in REQUIRED_ALWAYS:
            if not meta.get(key):
                errors.append(f"{where}: missing required field '{key}'")

        entry_type = meta.get("entry_type")
        legacy_type = meta.get("type")
        domain = meta.get("domain")
        publication_type = meta.get("publication_type")
        status = meta.get("status")
        is_literature = entry_type == "literature"

        if entry_type and entry_type not in ENTRY_TYPES:
            errors.append(f"{where}: invalid entry_type '{entry_type}'")
        if not entry_type and legacy_type not in LEGACY_TYPES:
            errors.append(f"{where}: missing required field 'entry_type'")
        if legacy_type in LEGACY_TYPES:
            warnings.append(f"{where}: legacy note is excluded from the paper-first app")
        if domain and domain not in DOMAINS:
            errors.append(f"{where}: invalid domain '{domain}' (expected one of {DOMAINS})")
        if publication_type and publication_type not in PUBLICATION_TYPES:
            errors.append(
                f"{where}: invalid publication_type '{publication_type}' "
                f"(expected one of {sorted(PUBLICATION_TYPES)})")
        if status and status not in STATUSES:
            errors.append(f"{where}: invalid status '{status}' (expected one of {sorted(STATUSES)})")

        if is_literature:
            for key in REQUIRED_LITERATURE:
                if not meta.get(key):
                    errors.append(f"{where}: literature record missing '{key}'")
            citation_key = meta.get("citation_key")
            if citation_key and citation_key != card.slug:
                errors.append(f"{where}: file name must equal citation_key '{citation_key}'")
            for section in LITERATURE_SECTIONS:
                if section not in card.body:
                    errors.append(f"{where}: missing required section '{section}'")
            positions = [card.body.find(section) for section in LITERATURE_SECTIONS]
            if all(position >= 0 for position in positions) and positions != sorted(positions):
                errors.append(f"{where}: literature sections are not in the required order")

        tags = meta.get("tags")
        if tags is not None and not isinstance(tags, list):
            errors.append(f"{where}: 'tags' must be a list")
        elif isinstance(tags, list):
            if is_literature and not 1 <= len(tags) <= 6:
                errors.append(f"{where}: literature records need 1-6 technical tags")
            for tag in tags:
                if not TAG_RE.match(str(tag)):
                    errors.append(f"{where}: tag '{tag}' must be lowercase kebab-case")
                if str(tag).isdigit():
                    errors.append(f"{where}: tag '{tag}' looks like a year; tags are technical topics")

        comments = meta.get("comments") or []
        if not isinstance(comments, list):
            errors.append(f"{where}: 'comments' must be a list")
        else:
            comment_ids: set[str] = set()
            for index, comment in enumerate(comments):
                prefix = f"{where}: comments[{index}]"
                if not isinstance(comment, dict):
                    errors.append(f"{prefix} must be a mapping")
                    continue
                for field in ("id", "author", "body", "created", "updated"):
                    if not str(comment.get(field, "")).strip():
                        errors.append(f"{prefix} missing '{field}'")
                comment_id = str(comment.get("id", "")).strip()
                if comment_id in comment_ids:
                    errors.append(f"{prefix} duplicates comment id '{comment_id}'")
                elif comment_id:
                    comment_ids.add(comment_id)
                if len(str(comment.get("body", ""))) > 4000:
                    errors.append(f"{prefix} body exceeds 4000 characters")

        if card.folder == PENDING_DIR:
            if status == "official":
                warnings.append(f"{where}: status is official; it will be promoted")
        elif status != "official":
            errors.append(f"{where}: card in {OFFICIAL_DIR}/ must have status official")

    all_slugs = set(slugs)
    for card in cards:
        if card.parse_error:
            continue
        where = card.rel_path
        related = card.meta.get("related") or []
        if not isinstance(related, list):
            errors.append(f"{where}: 'related' must be a list")
            related = []
        targets = {str(item) for item in related} | set(WIKILINK_RE.findall(card.body))
        for target in sorted(targets):
            target = target.strip()
            if target and target not in all_slugs:
                level = warnings if card.folder == PENDING_DIR else errors
                level.append(f"{where}: link to unknown card '{target}'")

    for message in warnings:
        print(f"WARN  {message}")
    for message in errors:
        print(f"ERROR {message}")
    print(f"\nChecked {len(cards)} records: {len(errors)} error(s), {len(warnings)} warning(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
