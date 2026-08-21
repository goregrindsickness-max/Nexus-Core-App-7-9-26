import sys

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    lines = f.readlines()

in_ue = False
level = 0
for i, line in enumerate(lines):
    line_num = i + 1
    if line_num >= 2931 and line_num <= 3300:
        if 'useEffect(() => {' in line:
            in_ue = True
            level = 0
            
        if in_ue:
            open_c = line.count('{')
            close_c = line.count('}')
            level += open_c - close_c
            print(f"{line_num}: [{level}] {line.strip()}")
            if level == 0 and close_c > 0:
                print(f"End at {line_num}")
                break
