# Literature record specification

Audio Literature Hub is a paper-first literature management system for a research group.
PDFs are archived in Google Drive; structured literature records are stored as Markdown
in this repository.

Legacy concept and algorithm notes remain readable during migration, but they are not
part of the main Library, Ratings, or Export workflow. Every new record uses
`entry_type: literature`.

## Frontmatter schema

```yaml
---
title: Adaptive noise cancelling: principles and applications
entry_type: literature
publication_type: journal-paper
domain: active-noise-control
venue: Proceedings of the IEEE
doi: 10.1109/PROC.1975.10036
abstract: ""
status: official
citation_key: widrow1975adaptive
authors: [B. Widrow, J. R. Glover]
year: 1975
tags: [anc, adaptive-filter, lms]
drive: []
related: []
created: 2026-06-12
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: YZY
uploaded_at: 2026-06-14T12:00:00.000Z
pdf_uploaded_by: YZY
pdf_uploaded_at: 2026-06-14T11:55:00.000Z
pdf_file_name: 0001_widrow1975adaptive.pdf
pdf_reused: false
activity: []
---
```

## Controlled fields

### `domain`

- `active-noise-control`
- `acoustic-echo-cancellation`
- `speech-enhancement`
- `source-separation`
- `beamforming-arrays`
- `spatial-audio`
- `audio-coding`
- `room-acoustics`
- `machine-learning-audio`
- `fundamentals-dsp`
- `other`

Domain is the primary organization axis. It controls personal rating queues.

### `publication_type`

- `journal-paper`
- `conference-paper`
- `preprint`
- `review-paper`
- `book`
- `book-chapter`
- `patent`
- `thesis`
- `technical-report`
- `dataset-paper`
- `other`

Publication type also determines the Google Drive archive subfolder.

### `tags`

Use one to six specific lowercase kebab-case technical topics, ordered broad to
narrow. Do not use years, author names, or generic labels such as `paper` or
`research`.

## Naming and duplicate rules

- File name equals `citation_key`.
- The citation key is lowercase kebab-case compatible.
- Drive duplicate detection uses DOI and citation key.
- GitHub publication checks DOI, normalized title, and citation key.

## Body layout

Every new literature record uses the same English structure:

```markdown
## Summary
## Problem
## Method
## Key results
## Strengths
## Limitations
## Relevance to our group
## Notes
## References
```

## Team evaluation

Members rate recommendation, innovation, and rigor from 1 to 5. The app converts
the three averages into a 0-100 team weight. Attributed comments and all PDF,
publication, rating, and comment actions are preserved in the record's audit trail.
