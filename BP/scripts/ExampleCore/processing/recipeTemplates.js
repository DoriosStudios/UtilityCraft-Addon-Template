// @ts-check

/**
 * Expands exactly one placeholder before a registry payload is dispatched.
 *
 * External registry payloads expect concrete item identifiers. This helper is
 * optional addon-owned preprocessing: it expands a compact template before the
 * result is sent to any UtilityCraft recipe registry.
 *
 * @param {Record<string, Record<string, unknown>>} recipes
 * @param {string} placeholder Placeholder name without braces, e.g. `wood`.
 * @param {string[]} values Concrete replacement values.
 */
export function expandRecipePlaceholder(recipes, placeholder, values) {
  const token = `{${placeholder}}`;
  /** @type {Record<string, Record<string, unknown>>} */
  const expanded = {};

  for (const [key, definition] of Object.entries(recipes)) {
    for (const value of values) {
      const expandedKey = key.split(token).join(value);
      const serialized = JSON.stringify(definition).split(token).join(value);
      expanded[expandedKey] = JSON.parse(serialized);
    }
  }

  return expanded;
}
