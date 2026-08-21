import re

def remove_prop(comp_text, prop_name):
    # Regex to match prop_name={...} or prop_name="value" taking newlines into account
    pattern = rf'\b{prop_name}\s*=\s*(?:\{{([^}}]*)\}}|\"[^\"]*\")\s*'
    return re.sub(pattern, '', comp_text)

with open('src/App.tsx', 'r') as f:
    app = f.read()

# Let's target the exact blocks for HomeV2DashboardView and MainTabRouter
# Actually, since I've already patched HomeV2DashboardView and MainTabRouter to use hooks internally,
# they won't complain if they receive extra props (unless the interface is strict).
# But wait, in patch_home.py and patch_main.py, I did NOT update the interfaces!
# So they STILL accept the props! They just use the hooks internally and ignore the props (or shadow them).
