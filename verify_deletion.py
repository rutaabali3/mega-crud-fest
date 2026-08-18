import subprocess
from pathlib import Path
repos=["cellar-keeper","cinemavault-watchlist","decision-flow","design-gembox","dew-drop-day","goal-weaver","home-health-manager","idle-task-manager","inner-counsel-app","interview-hub","ironlog-fitness","lingualearn-hub","localvibe-notes","media-vault","medilog-health-companion","my-local-address-book","my-recipe-box","orbit-mandala","pantry-pal","pet-pal-manager","plant-pal","practice-music","property-manager","pure-ledger-buddy","safe-haven-vault","shoot-planner-pro","streakly-habit-tracker","study-spark","subscription-vault","trip-planner-pro","wishful-gifts","yarn-and-wire"]
def exists(repo):
 p=subprocess.run(['gh','api',f'repos/rutaabali3/{repo}'],capture_output=True,text=True)
 return p.returncode==0
missing=sum(not exists(r) for r in repos)
mega=exists('mega-crud-fest')
projects=len([p for p in Path('/home/ubuntu/mega-crud-fest/projects').iterdir() if p.is_dir()])
print(f'originals_deleted={missing}/32')
print(f'mega_crud_fest_exists={mega}')
print(f'imported_project_dirs={projects}')
assert missing==32 and mega and projects==32
