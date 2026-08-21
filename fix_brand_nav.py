with open('src/components/navigation/BrandNavigationHeader.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if line.strip() == ")}":
        # The first time we see `)}` by itself, it's line 436 (the end of the navigation header div)
        # We should just close the fragment and the return statement.
        new_lines.append("    </>\n")
        new_lines.append("  );\n")
        new_lines.append("}\n")
        break
    new_lines.append(line)

with open('src/components/navigation/BrandNavigationHeader.tsx', 'w') as f:
    f.writelines(new_lines)
