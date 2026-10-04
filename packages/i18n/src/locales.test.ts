import { describe, expect, it } from 'vitest';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

function flatten(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (acc, [key, child]) => ({ ...acc, ...flatten(child, prefix ? `${prefix}.${key}` : key) }),
    {},
  );
}

const reference = flatten(fr);
const placeholders = (text: string) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]);

describe.each([
  ['en', en],
  ['es', es],
])('traductions %s', (_locale, messages) => {
  const flat = flatten(messages);

  it('ont exactement les mêmes clés que le français', () => {
    expect(Object.keys(flat).sort()).toEqual(Object.keys(reference).sort());
  });

  it('ne laissent aucune chaîne vide', () => {
    expect(Object.entries(flat).filter(([, text]) => !text.trim())).toEqual([]);
  });

  it('gardent les mêmes variables d’interpolation', () => {
    for (const [key, text] of Object.entries(reference)) {
      expect(placeholders(flat[key] ?? ''), key).toEqual(placeholders(text));
    }
  });
});
