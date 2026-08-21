import re

with open('src/components/LabelDashboardViewV2.tsx', 'r') as f:
    lines = f.readlines()

end_idx = 0
for i, line in enumerate(lines):
    if "Row 5: ROSTER GRID" in line or "Quick Action Buttons (Desktop)" in line or "Quick Action Buttons" in line:
        end_idx = i
        break

print(f"End index: {end_idx}")
