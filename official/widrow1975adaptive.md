---
title: 'Adaptive noise cancelling: principles and applications'
entry_type: literature
primary_domain: active-noise-control
domains: [active-noise-control, fundamentals-dsp]
publication_type: journal-paper
venue: Proceedings of the IEEE
doi: 10.1109/PROC.1975.10036
abstract: ""
status: official
citation_key: widrow1975adaptive
authors:
  - B. Widrow
  - J. R. Glover
  - J. M. McCool
  - J. Kaunitz
  - C. S. Williams
  - R. H. Hearn
  - J. R. Zeidler
  - E. Dong
  - R. C. Goodlin
year: 1975
tags:
  - anc
  - adaptive-filter
  - lms
drive: []
related:
  - active-noise-control
  - fxlms
created: '2026-06-12'
reviewed_by:
  - YZY
rating:
  recommendation: 3
  innovation: 3
  rigor: 3
  weight: 60
  count: 1
ratings:
  - reviewer: YZY
    recommendation: 3
    innovation: 3
    rigor: 3
    updated: '2026-06-14'
activity:
  - action: rating_added
    by: YZY
    at: '2026-06-14T07:42:05.782Z'
    detail: 'recommendation=3, innovation=3, rigor=3'
---
## Summary

The foundational paper on adaptive noise cancelling: a reference input correlated with the noise (but not the signal) is adaptively filtered and subtracted from the primary input, with the LMS algorithm driving the filter towards the Wiener solution without prior knowledge of signal statistics.

## Problem

- Cancelling via subtraction of an adaptively filtered reference — no fixed filter design needed.
- LMS adaptation converges to the Wiener filter under stationarity assumptions.
- Demonstrated on ECG, speech, and antenna sidelobe interference — the same structure generalizes across domains.

## Method

Primary input d(n) = s(n) + n0(n); reference x(n) correlated with n0. Adaptive filter output y(n) = wᵀ(n)x(n); error e(n) = d(n) − y(n) is both the system output and the adaptation signal: w(n+1) = w(n) + 2μ e(n) x(n).

## Key results

Strong interference rejection in ECG fetal-heartbeat extraction and 60 Hz hum removal; convergence behaviour analysed via eigenvalue spread of the reference autocorrelation matrix.

## Strengths

The paper establishes a general adaptive cancellation structure and demonstrates it across several application domains. Its formulation connects practical LMS adaptation to the Wiener solution without requiring prior signal statistics.

## Limitations

The analysis relies on stationarity and reference-signal assumptions that may not hold in rapidly changing acoustic systems. It predates the secondary-path treatment required by practical active noise control.

## Relevance to our group

The direct ancestor of [[fxlms]] — FxLMS adds the secondary-path filter into the reference branch to handle acoustic ANC. Read §IV before implementing anything.

## Notes

The team rating and comments should capture whether this remains essential reading for current ANC work.

## References

- Related cards: [[active-noise-control]], [[fxlms]]
- B. Widrow et al., "Adaptive noise cancelling: principles and applications," *Proc. IEEE*, vol. 63, no. 12, 1975.
