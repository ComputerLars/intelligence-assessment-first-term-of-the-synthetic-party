#!/usr/bin/env python3
"""Whole-input language screening for A15-D02. Requires langid==1.1.6 and numpy.
Writes only summary counts and source-row classifications, never prompt bodies.
"""
from pathlib import Path
import argparse,csv,hashlib,json,re
from langid.langid import LanguageIdentifier,model

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--expected-source-sha256',required=True,help='Hash of the original analysed witness supplied by its custodian; not the later redacted derivative')
    a=p.parse_args();raw=a.source.read_bytes();s=raw.decode('utf-8-sig')
    expected=a.expected_source_sha256
    edition=Path(__file__).resolve().parents[4]
    out=a.out.resolve()
    if out==edition or edition in out.parents:raise SystemExit('Write results outside the edition')
    if hashlib.sha256(raw).hexdigest()!=expected:raise SystemExit('Source hash differs from the examined edition')
    starts=list(re.finditer(r'^\s*(\d+)\s*\|\s*(computerlars|\[U\d+\]):\s*',s,re.M))
    classifier=LanguageIdentifier.from_modelstring(model,norm_probs=True)
    family={'da','nb','no','nn','sv'};rows=[]
    for i,m in enumerate(starts):
        end=starts[i+1].start() if i+1<len(starts) else len(s)
        segment=s[m.end():end]
        n=segment.count('-> Leder Lars:')
        if n==0:continue
        if n!=1:raise ValueError('Inspect source row '+m[1])
        prompt=segment.split('-> Leder Lars:',1)[0].strip()
        if prompt.startswith('!'):prompt=prompt[1:].strip()
        language,_=classifier.classify(prompt)
        operator=m[2]=='computerlars';alpha=sum(c.isalpha() for c in prompt)
        eligible=not operator and alpha>=10
        rows.append({'source_start_row':int(m[1]),'operator_label':operator,'alphabetic_characters':alpha,'language_code':language,'eligible_for_language_screen':eligible,'coded_outside_scandinavian':eligible and language not in family})
    total=sum(not r['operator_label'] for r in rows)
    count=sum(r['coded_outside_scandinavian'] for r in rows)
    report={'source_sha256':expected,'completed_exchanges':len(rows),'other_label_exchanges':total,'coded_outside_scandinavian':count,'percentage':100*count/total,'minimum_alphabetic_characters':10,'classifier':'langid 1.1.6','scandinavian_codes_grouped':sorted(family)}
    a.out.mkdir(parents=True,exist_ok=True)
    (a.out/'language_counts.json').write_text(json.dumps(report,indent=2)+'\n')
    with (a.out/'whole_input_language_index.csv').open('w',newline='') as f:
        w=csv.DictWriter(f,list(rows[0]));w.writeheader();w.writerows(rows)
    print(json.dumps(report,indent=2))
if __name__=='__main__':main()
