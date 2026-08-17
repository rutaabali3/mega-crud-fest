

## Plan: Make completed days green

Currently, completed days use the habit's custom color via HSL conversion. The user wants completed days to always be **green**.

### Change
In `src/components/Heatmap.tsx`, update the `completed` modifier style (line 107) from the dynamic habit color to a fixed green:
- `backgroundColor: "hsl(142 71% 45%)"` (a vibrant green)
- Also update the legend swatch at the bottom to match the same green

### Files modified
- `src/components/Heatmap.tsx` — two small edits (completed style + legend color)

