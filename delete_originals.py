import subprocess
repos=["cellar-keeper","cinemavault-watchlist","decision-flow","design-gembox","dew-drop-day","goal-weaver","home-health-manager","idle-task-manager","inner-counsel-app","interview-hub","ironlog-fitness","lingualearn-hub","localvibe-notes","media-vault","medilog-health-companion","my-local-address-book","my-recipe-box","orbit-mandala","pantry-pal","pet-pal-manager","plant-pal","practice-music","property-manager","pure-ledger-buddy","safe-haven-vault","shoot-planner-pro","streakly-habit-tracker","study-spark","subscription-vault","trip-planner-pro","wishful-gifts","yarn-and-wire"]
assert len(repos)==32 and 'mega-crud-fest' not in repos
for i,repo in enumerate(repos,1):
    p=subprocess.run(['gh','repo','delete',f'rutaabali3/{repo}','--yes'],capture_output=True,text=True)
    status='DELETED' if p.returncode==0 else 'FAILED'
    print(f'{i:02d}/32 {repo} {status} {p.stderr.strip()[:160]}',flush=True)
