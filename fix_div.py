with open("src/components/PromoterDashboardViewV2.tsx", "r") as f:
    lines = f.read().split('\n')

for i in range(1975, 1985):
    print(f"{i+1}: {lines[i]}")
