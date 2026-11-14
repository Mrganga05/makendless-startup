/* JS mirror of the colour tokens in app/globals.css — for Three.js materials, canvas and inline styles ONLY.
   In JSX prefer the Tailwind token classes (bg-ink, text-muted, text-create, ...). Keep both files in sync. */
export const color = {
  ink: "#0c1024", inkDeep: "#080b1a", surface: "#202342", surface2: "#161a38",
  paper: "#f6f7fc", paper2: "#ebeefa", line: "#d9dcec",
  violet: "#6f45f6", violetSoft: "#c7a6ff", aqua: "#08bbd4", aquaBright: "#22d3ee",
  light: "#f6f8ff", dark: "#13172b", muted: "#a4aac7", mutedDark: "#5a6082",
  create: "#22d3ee", build: "#8b5cf6", grow: "#c7a6ff",
} as const;
export const prism = "linear-gradient(115deg, #22d3ee 0%, #8b5cf6 52%, #c7a6ff 100%)";
export const accentOf = { create: color.create, build: color.build, grow: color.grow } as const;
