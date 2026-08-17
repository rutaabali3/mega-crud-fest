from pathlib import Path
import subprocess, shutil, csv, time
repos=["cellar-keeper","cinemavault-watchlist","decision-flow","design-gembox","dew-drop-day","goal-weaver","home-health-manager","idle-task-manager","inner-counsel-app","interview-hub","ironlog-fitness","lingualearn-hub","localvibe-notes","media-vault","medilog-health-companion","my-local-address-book","my-recipe-box","orbit-mandala","pantry-pal","pet-pal-manager","plant-pal","practice-music","property-manager","pure-ledger-buddy","safe-haven-vault","shoot-planner-pro","streakly-habit-tracker","study-spark","subscription-vault","trip-planner-pro","wishful-gifts","yarn-and-wire"]
root=Path('/home/ubuntu/mega-crud-fest'); tmp=root/'.source-import-tmp'; dest=root/'projects'; tmp.mkdir(exist_ok=True); dest.mkdir(exist_ok=True)
rows=[]
for i,repo in enumerate(repos,1):
    clone=tmp/repo; target=dest/repo
    if target.exists(): shutil.rmtree(target)
    if clone.exists(): shutil.rmtree(clone)
    print(f'{i:02d}/{len(repos)} cloning {repo}',flush=True)
    p=subprocess.run(['gh','repo','clone',f'rutaabali3/{repo}',str(clone),'--','--depth','1'],capture_output=True,text=True)
    if p.returncode:
        rows.append((repo,'CLONE_FAILED',p.stderr.strip()[:180])); print('  FAILED',flush=True); continue
    target.mkdir(parents=True)
    archive=subprocess.run(['git','-C',str(clone),'archive','HEAD'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if archive.returncode:
        rows.append((repo,'ARCHIVE_FAILED',archive.stderr.strip()[:180])); print('  ARCHIVE_FAILED',flush=True); continue
    extract=subprocess.run(['tar','-x','-C',str(target)],input=archive.stdout)
    if extract.returncode:
        rows.append((repo,'EXTRACT_FAILED','tar failed')); print('  EXTRACT_FAILED',flush=True); continue
    count=sum(1 for pth in target.rglob('*') if pth.is_file())
    rows.append((repo,'IMPORTED',str(count))); print(f'  imported {count} files',flush=True)
    shutil.rmtree(clone)
    time.sleep(.2)
shutil.rmtree(tmp,ignore_errors=True)
(root/'source-import.tsv').write_text('repo\tstatus\tfile_count_or_detail\n'+'\n'.join('\t'.join(r) for r in rows)+'\n')
print(f'Completed {sum(r[1]=="IMPORTED" for r in rows)}/{len(repos)} imports')
