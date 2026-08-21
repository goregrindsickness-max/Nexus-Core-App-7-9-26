with open('src/components/dashboard/HomeV2DashboardView.tsx', 'r') as f:
    lines = f.readlines()

end_idx = 0
for i, line in enumerate(lines):
    if "} = props" in line or "} = props;" in line or line.strip() == "} = props;":
        end_idx = i
        break
print(f"Ends at {end_idx}")
