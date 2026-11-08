import glob,os,re,collections,sys
qs=collections.defaultdict(list); ans=collections.defaultdict(list); bad=0
norm=lambda s: re.sub(r"[^a-z0-9àâçéèêëîïôûùüÿœ]+"," ",s.lower()).strip()
for p in sorted(glob.glob('content/*.txt')):
    th=os.path.basename(p)[:-4]
    for i,l in enumerate(open(p,encoding='utf-8').read().splitlines()):
        if not l.strip(): continue
        f=l.split('|')
        if len(f) not in (5,7): print("FORMAT",th,i+1,len(f)); bad+=1; continue
        if f[0] not in "123": print("LVL",th,i+1); bad+=1
        ch=f[2:6] if len(f)==7 else f[2:4]
        if len(set(ch))!=len(ch): print("CHOIX",th,i+1); bad+=1
        qs[norm(f[1])].append((th,i+1)); ans[norm(f[2])].append((th,i+1,f[1][:70]))
for k,v in qs.items():
    if len(v)>1: print("Q DUP",v)
for k,v in ans.items():
    if len(v)>1 and len(k)>3: print("A",k,"->",v)
print("erreurs",bad)
