#!/usr/bin/env python3
"""Read-only article recount. Outputs must be outside the edition. No language inference."""
import argparse,csv,hashlib,json,re
from pathlib import Path

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--archive',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
 root=a.archive.resolve();out=a.out.resolve()
 if out==root or root in out.parents:raise SystemExit('Keep recount output outside the source edition')
 raw=(root/'data/A15-D02.txt').read_bytes();text=raw.decode('utf-8-sig')
 starts=list(re.finditer(r'^\s*(\d+)\s*\|\s*(computerlars|\[U\d+\]):\s*',text,re.M));complete=[];fragments=[]
 for i,m in enumerate(starts):
  end=starts[i+1].start() if i+1<len(starts) else len(text);n=text[m.end():end].count('-> Leder Lars:')
  row={'source_start_row':int(m[1]),'operator_label':m[2]=='computerlars','reply_markers':n}
  if n==1:complete.append(row)
  elif n==0:fragments.append(row['source_start_row'])
  else:raise ValueError('Multiple reply markers; inspect source row '+m[1])
 assert len(complete)==text.count('-> Leder Lars:')
 operator=sum(x['operator_label'] for x in complete)
 invoices=[]
 for ident,month,amount in [('A08-D12','2022-09',9),('A08-D08','2022-10',200),('A08-D05','2022-10',170)]:
  raw_invoice=(root/f'documents/{ident}.txt').read_bytes();t=raw_invoice.decode()
  observed=re.search(r'\$([\d,.]+) paid on ([^\n]+)',t)
  assert observed and float(observed[1].replace(',',''))==amount
  assert ('September 2022' if month.endswith('09') else 'October 2022') in t
  invoices.append({'source_id':ident,'consumption_month':month,'USD':amount,'payment_date':observed[2].strip(),'source_sha256':hashlib.sha256(raw_invoice).hexdigest()})
 report={'source':'data/A15-D02.txt','source_sha256':hashlib.sha256(raw).hexdigest(),'completed_input_response_units':len(complete),'Computer_Lars_label_units':operator,'other_label_units':len(complete)-operator,'speaker_fragments_without_reply':fragments,'language_coding':'Prior 3,454 whole-input subclaim not verified. Located fragment-level langid selection uses different units and does not establish that census.','unit':'completed input-response exchange, not person, voter, membership or API call','invoices':invoices,'October_USD':sum(x['USD'] for x in invoices if x['consumption_month']=='2022-10'),'September_USD':sum(x['USD'] for x in invoices if x['consumption_month']=='2022-09'),'prompt_cost_average':None}
 out.mkdir(parents=True,exist_ok=True);(out/'counts.json').write_text(json.dumps(report,indent=2)+'\n')
 with (out/'completed_unit_index.csv').open('w',newline='') as f:
  w=csv.DictWriter(f,['source_start_row','operator_label','reply_markers']);w.writeheader();w.writerows(complete)
 print(json.dumps({k:report[k] for k in ['completed_input_response_units','Computer_Lars_label_units','other_label_units','October_USD','September_USD']}))
if __name__=='__main__':main()
