import L from "front/@global/Language";

export function renderTheme(theme: string) {
  const R = L.get(`theme_${theme}`);
  return R.length === 0 ? L.get("departure4_noTheme") : R;
}
