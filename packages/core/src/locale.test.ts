import { describe, expect, it } from 'vitest';

import { localize, localizedTextSchema, resolveLocale } from './locale';

describe('resolveLocale', () => {
  it('prend la première langue prise en charge', () => {
    expect(resolveLocale(['de-DE', 'es-MX', 'en-US'])).toBe('es');
  });

  it('ignore la casse et les séparateurs', () => {
    expect(resolveLocale(['EN_gb'])).toBe('en');
  });

  it('retombe sur le français', () => {
    expect(resolveLocale(['de', null, undefined])).toBe('fr');
    expect(resolveLocale([])).toBe('fr');
  });
});

describe('localize', () => {
  it('renvoie la traduction demandée', () => {
    expect(localize({ fr: 'Bonjour', es: 'Hola' }, 'es')).toBe('Hola');
  });

  it('retombe sur le français si la traduction manque ou est vide', () => {
    expect(localize({ fr: 'Bonjour', en: '  ' }, 'en')).toBe('Bonjour');
  });

  it('retombe sur une autre langue si le français manque', () => {
    expect(localize({ en: 'Hello' }, 'es')).toBe('Hello');
  });

  it('gère une valeur absente', () => {
    expect(localize(null, 'fr')).toBe('');
  });
});

describe('localizedTextSchema', () => {
  it('exige le français et refuse les langues inconnues', () => {
    expect(localizedTextSchema.safeParse({ fr: 'Oui' }).success).toBe(true);
    expect(localizedTextSchema.safeParse({ en: 'Yes' }).success).toBe(false);
    expect(localizedTextSchema.safeParse({ fr: 'Oui', de: 'Ja' }).success).toBe(false);
  });
});
