/**
 * Maps an API slug in the catalog to a demo registered in
 * `/public/sandbox/runner.html`, along with any parameter inputs the
 * user can tweak before re-running.
 *
 * Slugs that don't appear here show a "no demo yet" state on the detail
 * page, which will eventually prompt the user to submit one.
 */
export interface ParamDef {
  key: string
  label: string
  placeholder: string
  defaultValue?: string
}

export interface DemoConfig {
  demoKey: string
  height?: number
  paramDefs?: ParamDef[]
}

export const DEMO_CONFIGS: Record<string, DemoConfig> = {
  'cat-facts': { demoKey: 'cat-facts', height: 180 },
  'dog-ceo': { demoKey: 'dog-ceo', height: 340 },
  jokeapi: { demoKey: 'jokeapi', height: 200 },
  'open-trivia-db': { demoKey: 'open-trivia-db', height: 240 },
  'rest-countries': {
    demoKey: 'rest-countries',
    height: 180,
    paramDefs: [
      {
        key: 'name',
        label: 'Country name',
        placeholder: 'e.g. france',
        defaultValue: 'germany',
      },
    ],
  },
  pokeapi: {
    demoKey: 'pokeapi',
    height: 180,
    paramDefs: [
      {
        key: 'name',
        label: 'Pokémon',
        placeholder: 'e.g. charizard',
        defaultValue: 'pikachu',
      },
    ],
  },
  'nasa-apod': { demoKey: 'nasa-apod', height: 460 },
  'open-meteo': {
    demoKey: 'open-meteo',
    height: 200,
    paramDefs: [
      { key: 'lat', label: 'Latitude', placeholder: '52.52', defaultValue: '52.52' },
      { key: 'lon', label: 'Longitude', placeholder: '13.41', defaultValue: '13.41' },
    ],
  },
}

export function getDemoConfig(slug: string): DemoConfig | null {
  return DEMO_CONFIGS[slug] ?? null
}
