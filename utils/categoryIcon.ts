import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export const FALLBACK_CATEGORY_ICON: MaterialIconName = 'category';

// exp_tc_icon is free text stored per-category. If it doesn't match a real
// MaterialIcons glyph (picked from a different icon set at some point, a
// stale/renamed glyph, a typo), MaterialIcons renders nothing rather than
// throwing - the icon just silently goes blank. Validate against the actual
// glyph map and fall back to a generic icon instead of a blank badge.
export function getCategoryIconName(name: string | null | undefined): MaterialIconName {
  if (name && name in MaterialIcons.glyphMap) {
    return name as MaterialIconName;
  }
  return FALLBACK_CATEGORY_ICON;
}
