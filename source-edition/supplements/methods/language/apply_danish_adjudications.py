#!/usr/bin/env python3
"""Apply the supplied Danish-language adjudications to the A15-D02 baseline.

The decisions are fixed research inputs, not judgments made by this script.
Outputs contain source rows and coding metadata, never prompt text or identities.
"""
import argparse
import csv
import json
import hashlib
from collections import Counter
from pathlib import Path

ANALYSIS_VERSION = 'METHOD-A15-A08/2026-10-26'
BASELINE_INDEX_SHA256 = '81ac3599e672b38de3967a344bace58f6adf1185dfdeee5e7cac4e4243c0c6ab'
FAMILY = {'da', 'nb', 'no', 'nn', 'sv'}
LABELS = {'danish_or_danish_compatible', 'non_danish_or_mixed', 'unclassified'}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source-index', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    edition = Path(__file__).resolve().parents[4]
    out = a.out.resolve()
    if out == edition or edition in out.parents:
        raise SystemExit('Write results outside the edition')
    if hashlib.sha256(a.source_index.read_bytes()).hexdigest() != BASELINE_INDEX_SHA256:
        raise ValueError('Index differs from the preserved analysis baseline')
    overrides = json.loads((Path(__file__).parent/'danish_adjudications.json').read_text())
    if not set(overrides.values()) <= LABELS:
        raise ValueError('Unknown adjudication category')
    with a.source_index.open(newline='') as f:
        baseline = list(csv.DictReader(f))
    if len(baseline) != 5097 or len({r['source_start_row'] for r in baseline}) != 5097:
        raise ValueError('Expected 5,097 unique completed exchanges')
    if any(r['operator_label'].lower() not in {'true', 'false'} for r in baseline):
        raise ValueError('Invalid operator-label field')
    eligible_rows = {r['source_start_row'] for r in baseline
                     if r['operator_label'].lower() == 'false' and int(r['alphabetic_characters']) >= 10}
    if not set(overrides) <= eligible_rows:
        raise ValueError('Adjudication refers to a missing, short or operator input')
    rows = []
    for r in baseline:
        if r['operator_label'].lower() == 'true':
            continue
        n = r['source_start_row']
        alpha = int(r['alphabetic_characters'])
        code = r['language_code']
        if alpha < 10:
            label, basis = 'unclassified', 'below ten alphabetic characters'
        elif n in overrides:
            label, basis = overrides[n], 'manual adjudication'
        elif code in FAMILY:
            label = 'danish_or_danish_compatible'
            basis = 'automated Danish label' if code == 'da' else 'manual neighbouring-language review'
        else:
            label, basis = 'non_danish_or_mixed', 'automated label retained after targeted checks'
        rows.append({'source_start_row': n, 'automatic_language_code': code,
                     'alphabetic_characters': alpha, 'danish_specific_screen': label, 'basis': basis})
    if len(rows) != 4808:
        raise ValueError('Expected 4,808 exchanges under other labels')
    counts = Counter(r['danish_specific_screen'] for r in rows)
    short = sum(r['alphabetic_characters'] < 10 for r in rows)
    result = {
        'source': 'source-edition/data/A15-D02.txt', 'analysis_version': ANALYSIS_VERSION,
        'completed_non_operator_exchanges': len(rows),
        'danish_or_danish_compatible': counts['danish_or_danish_compatible'],
        'unclassified': counts['unclassified'], 'non_danish_or_mixed': counts['non_danish_or_mixed'],
        'percentage_non_danish_or_mixed': 100*counts['non_danish_or_mixed']/len(rows),
        'short_inputs_left_unclassified': short,
        'code_noise_or_name_only_unclassified': counts['unclassified']-short,
        'uncorrected_da_only_classifier_count': sum(r['alphabetic_characters'] >= 10 and r['automatic_language_code'] != 'da' for r in rows),
        'method': 'langid 1.1.6 whole-input coding followed by targeted manual correction; includes mixed-language inputs; not a complete manual census',
    }
    a.out.mkdir(parents=True, exist_ok=True)
    with (a.out/'danish_specific_index.csv').open('w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
    (a.out/'danish_specific_counts.json').write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
