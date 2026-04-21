import { slugify } from '@/lib/utils'
import type { PublicApi } from './types'

/**
 * Curated seed list of public APIs. Sourced from public-apis.dev with a bias
 * toward APIs that have CORS enabled (so the in-browser sandbox can call
 * them without a proxy) and need no auth to demo.
 *
 * To add more: append to this list and re-run the seed endpoint. The `slug`
 * is derived from the name, so renames create a new row — prefer editing
 * description/category in place.
 */
const RAW: Omit<PublicApi, 'slug'>[] = [
  // Animals
  {
    name: 'Cat Facts',
    description: 'Random facts about cats — simple JSON, no auth.',
    category: 'Animals',
    url: 'https://catfact.ninja/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'Dog CEO',
    description: 'Random dog images across dozens of breeds.',
    category: 'Animals',
    url: 'https://dog.ceo/dog-api/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'Axolotl',
    description: 'Random axolotl pictures and facts. Yes, really.',
    category: 'Animals',
    url: 'https://theaxolotlapi.netlify.app/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Entertainment
  {
    name: 'JokeAPI',
    description: 'Programming, dark, pun, and spooky jokes with filters.',
    category: 'Entertainment',
    url: 'https://v2.jokeapi.dev/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'Open Trivia DB',
    description: 'Thousands of trivia questions across 24 categories.',
    category: 'Entertainment',
    url: 'https://opentdb.com/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'Bored API',
    description: 'Random activities when you are out of ideas.',
    category: 'Entertainment',
    url: 'https://bored-api.appbrewery.com/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Games & Comics
  {
    name: 'PokeAPI',
    description: 'Comprehensive Pokémon data: species, moves, types, sprites.',
    category: 'Games',
    url: 'https://pokeapi.co/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'Rick and Morty',
    description: 'Characters, locations, and episodes from the show.',
    category: 'Games',
    url: 'https://rickandmortyapi.com/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'Disney API',
    description: 'Disney characters, films, parks, and attractions.',
    category: 'Games',
    url: 'https://disneyapi.dev/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Science & Space
  {
    name: 'SpaceX',
    description: 'Launches, rockets, capsules, and launchpad data.',
    category: 'Science',
    url: 'https://github.com/r-spacex/SpaceX-API',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'NASA APOD',
    description: 'Astronomy Picture of the Day with explanation.',
    category: 'Science',
    url: 'https://api.nasa.gov/',
    auth: 'apiKey',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'Open Notify',
    description: 'ISS location, pass times, and crew aboard.',
    category: 'Science',
    url: 'http://open-notify.org/',
    auth: 'No',
    https: false,
    cors: 'No',
  },

  // Weather
  {
    name: 'Open-Meteo',
    description: 'Free weather forecasts, no API key required.',
    category: 'Weather',
    url: 'https://open-meteo.com/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Geography
  {
    name: 'REST Countries',
    description: 'Country data: flag, capital, currencies, languages.',
    category: 'Geography',
    url: 'https://restcountries.com/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'IP API',
    description: 'Geolocate an IP address — city, region, timezone, ISP.',
    category: 'Geography',
    url: 'https://ip-api.com/',
    auth: 'No',
    https: false,
    cors: 'Yes',
  },

  // Books & Quotes
  {
    name: 'Open Library',
    description: 'Book metadata, covers, authors — powered by the Internet Archive.',
    category: 'Books',
    url: 'https://openlibrary.org/developers/api',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'Quotable',
    description: 'Random or curated quotes, searchable by author or tag.',
    category: 'Books',
    url: 'https://github.com/lukePeavey/quotable',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Food
  {
    name: 'TheMealDB',
    description: 'Recipes, ingredients, and meal photos worldwide.',
    category: 'Food',
    url: 'https://www.themealdb.com/api.php',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'TheCocktailDB',
    description: 'Cocktail recipes with ingredient lists and photos.',
    category: 'Food',
    url: 'https://www.thecocktaildb.com/api.php',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Music
  {
    name: 'Deezer',
    description: 'Tracks, artists, albums, and charts from Deezer.',
    category: 'Music',
    url: 'https://developers.deezer.com/',
    auth: 'No',
    https: true,
    cors: 'No',
  },
  {
    name: 'Lyrics.ovh',
    description: 'Get lyrics by artist and title. Straightforward.',
    category: 'Music',
    url: 'https://lyricsovh.docs.apiary.io/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Users & Test Data
  {
    name: 'RandomUser',
    description: 'Realistic random users for prototyping — name, photo, email.',
    category: 'Test Data',
    url: 'https://randomuser.me/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'JSONPlaceholder',
    description: 'Fake REST API for posts, comments, todos, users.',
    category: 'Test Data',
    url: 'https://jsonplaceholder.typicode.com/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Finance
  {
    name: 'Frankfurter',
    description: 'Free currency conversion with historical rates (ECB data).',
    category: 'Finance',
    url: 'https://www.frankfurter.app/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'CoinGecko',
    description: 'Crypto prices, market cap, and historical data.',
    category: 'Finance',
    url: 'https://www.coingecko.com/en/api',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Words & Language
  {
    name: 'Dictionary API',
    description: 'Word definitions, examples, and phonetics in many languages.',
    category: 'Words',
    url: 'https://dictionaryapi.dev/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
  {
    name: 'Datamuse',
    description: 'Word-finding engine: rhymes, synonyms, related terms.',
    category: 'Words',
    url: 'https://www.datamuse.com/api/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },

  // Art & Design
  {
    name: 'Art Institute of Chicago',
    description: 'Public-domain artworks with high-res images and metadata.',
    category: 'Art',
    url: 'https://api.artic.edu/docs/',
    auth: 'No',
    https: true,
    cors: 'Yes',
  },
]

export const PUBLIC_APIS: PublicApi[] = RAW.map((api) => ({
  ...api,
  slug: slugify(api.name),
}))
