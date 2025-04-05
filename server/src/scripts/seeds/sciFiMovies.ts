import { Column } from '@shared/types';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const sciFiMoviesColumns: Column[] = [
  {
    columnId: randomUUID(),
    name: 'Movie Name',
    type: 'text',
    description: 'Name of the sci-fi movie',
  },
  {
    columnId: randomUUID(),
    name: 'Director',
    type: 'text',
    description: 'Director of the movie',
  },
  {
    columnId: randomUUID(),
    name: 'Imdb link',
    type: 'link',
    description: 'Link to the movie on IMDB',
  },
  {
    columnId: randomUUID(),
    name: 'Release Year',
    type: 'number',
    description: 'Year the movie was released',
  },
  {
    columnId: randomUUID(),
    name: 'Rotten Tomatoes Score',
    type: 'text',
    description: 'Rating on Rotten Tomatoes tomatometer',
  },
  {
    columnId: randomUUID(),
    name: 'IMDb Score',
    type: 'number',
    description: 'Rating on IMDB',
  },
  {
    columnId: randomUUID(),
    name: 'Duration (Hours)',
    type: 'number',
    description: 'Movie length in hours',
  },
  {
    columnId: randomUUID(),
    name: 'Concise Description',
    type: 'text',
    description: 'Brief summary of the movie plot',
  },
  {
    columnId: randomUUID(),
    name: 'Awards',
    type: 'text',
    description: 'Major awards won by the movie',
  },
  {
    columnId: randomUUID(),
    name: 'Trailer link',
    type: 'link',
    description: 'Link to the official trailer',
  },
];

// Create a mapping of column names to column IDs for data transformation
const columnNameToId = Object.fromEntries(
  sciFiMoviesColumns.map((col) => [col.name, col.columnId])
);

// Transform the sci-fi movies data to use column IDs instead of names
export const sciFiMoviesData = [
  {
    [columnNameToId['Movie Name']]: 'Advantageous (2015)',
    [columnNameToId['Director']]: 'Jennifer Phang',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt3090670/',
    [columnNameToId['Release Year']]: 2015,
    [columnNameToId['Rotten Tomatoes Score']]: '88%',
    [columnNameToId['IMDb Score']]: 6.2,
    [columnNameToId['Duration (Hours)']]: 1.5,
    [columnNameToId['Concise Description']]:
      "Mother transfers consciousness into younger body to secure daughter's future.",
    [columnNameToId['Awards']]: 'Sundance Award (Grand Jury Prize)',
    [columnNameToId['Trailer link']]: 'https://youtu.be/jnBT0izYi7A?si=7h-54NWynRQsi5gp',
  },
  {
    [columnNameToId['Movie Name']]: 'Upgrade (2018)',
    [columnNameToId['Director']]: 'Leigh Whannell',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt6499752/',
    [columnNameToId['Release Year']]: 2018,
    [columnNameToId['Rotten Tomatoes Score']]: '88%',
    [columnNameToId['IMDb Score']]: 7.5,
    [columnNameToId['Duration (Hours)']]: 1.7,
    [columnNameToId['Concise Description']]:
      'Paralyzed man gains revenge via AI implant in dystopian thriller.',
    [columnNameToId['Awards']]: 'Saturn Award nomination (Best Sci-Fi Film)',
    [columnNameToId['Trailer link']]: 'https://youtu.be/36PDeN9NRZ0?si=ASN2bjbrswJzhMv1',
  },
  {
    [columnNameToId['Movie Name']]: 'Appleseed (2004)',
    [columnNameToId['Director']]: 'Shinji Aramaki',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt0401233/',
    [columnNameToId['Release Year']]: 2004,
    [columnNameToId['Rotten Tomatoes Score']]: '26%',
    [columnNameToId['IMDb Score']]: 6.9,
    [columnNameToId['Duration (Hours)']]: 1.7,
    [columnNameToId['Concise Description']]:
      'Post-apocalyptic sci-fi with cyborg soldiers and existential themes.',
    [columnNameToId['Awards']]: '',
    [columnNameToId['Trailer link']]: 'https://youtu.be/j17h7gBFOzI?si=C0acePrV_1mEH_lK',
  },
  {
    [columnNameToId['Movie Name']]: 'Ghost in the Shell (2017)',
    [columnNameToId['Director']]: 'Rupert Sanders',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt1219827/',
    [columnNameToId['Release Year']]: 2017,
    [columnNameToId['Rotten Tomatoes Score']]: '43%',
    [columnNameToId['IMDb Score']]: 6.3,
    [columnNameToId['Duration (Hours)']]: 1.8,
    [columnNameToId['Concise Description']]:
      'Cyber-enhanced agent uncovers conspiracy in dystopian future.',
    [columnNameToId['Awards']]: '',
    [columnNameToId['Trailer link']]: 'https://youtu.be/tRkb1X9ovI4?si=jKlmccFzEoNZTOVs',
  },
  {
    [columnNameToId['Movie Name']]: 'Proxima (2019)',
    [columnNameToId['Director']]: 'Alice Winocour',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt7374926/',
    [columnNameToId['Release Year']]: 2019,
    [columnNameToId['Rotten Tomatoes Score']]: '85%',
    [columnNameToId['IMDb Score']]: 6.4,
    [columnNameToId['Duration (Hours)']]: 1.8,
    [columnNameToId['Concise Description']]: 'Astronaut balances mission to Mars with motherhood.',
    [columnNameToId['Awards']]: "Cannes Film Festival (Directors' Fortnight)",
    [columnNameToId['Trailer link']]: 'https://youtu.be/8SFhBakU7A0?si=6bd_mhjgA8Xn6gt4',
  },
  {
    [columnNameToId['Movie Name']]: 'Ex Machina',
    [columnNameToId['Director']]: 'Alex Garland',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt0470752/',
    [columnNameToId['Release Year']]: 2014,
    [columnNameToId['Rotten Tomatoes Score']]: '92%',
    [columnNameToId['IMDb Score']]: 7.7,
    [columnNameToId['Duration (Hours)']]: 1.8,
    [columnNameToId['Concise Description']]:
      'Programmer evaluates humanoid AI in psychological thriller.',
    [columnNameToId['Awards']]:
      'Oscar (Best Visual Effects); BAFTA nomination (Best Original Screenplay)',
    [columnNameToId['Trailer link']]: 'https://www.youtube.com/watch?v=gyKqHOgMi4g',
  },
  {
    [columnNameToId['Movie Name']]: 'Metropolis (2001)',
    [columnNameToId['Director']]: 'Rintaro',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt0293416/',
    [columnNameToId['Release Year']]: 2001,
    [columnNameToId['Rotten Tomatoes Score']]: '86%',
    [columnNameToId['IMDb Score']]: 7.4,
    [columnNameToId['Duration (Hours)']]: 1.8,
    [columnNameToId['Concise Description']]:
      "Anime adaptation of Fritz Lang's classic, blending cyberpunk and social critique.",
    [columnNameToId['Awards']]: '',
    [columnNameToId['Trailer link']]: 'https://youtu.be/aen2v31UjqA?si=VQ7q_c_yxY-rGWiv',
  },
  {
    [columnNameToId['Movie Name']]: 'Arrival',
    [columnNameToId['Director']]: 'Denis Villeneuve',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt2543164/',
    [columnNameToId['Release Year']]: 2016,
    [columnNameToId['Rotten Tomatoes Score']]: '94%',
    [columnNameToId['IMDb Score']]: 7.9,
    [columnNameToId['Duration (Hours)']]: 1.9,
    [columnNameToId['Concise Description']]:
      'Linguist deciphers alien language to prevent global crisis.',
    [columnNameToId['Awards']]: 'Oscar (Sound Editing); BAFTA nomination (Best Director)',
    [columnNameToId['Trailer link']]: 'https://www.youtube.com/watch?v=tFMo3UJ4B4g',
  },
  {
    [columnNameToId['Movie Name']]: 'Stowaway (2021)',
    [columnNameToId['Director']]: 'Joe Penna',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt9203694/',
    [columnNameToId['Release Year']]: 2021,
    [columnNameToId['Rotten Tomatoes Score']]: '76%',
    [columnNameToId['IMDb Score']]: 5.6,
    [columnNameToId['Duration (Hours)']]: 1.9,
    [columnNameToId['Concise Description']]:
      'Crew discovers stowaway on Mars mission, forcing ethical decisions.',
    [columnNameToId['Awards']]: '',
    [columnNameToId['Trailer link']]: 'https://youtu.be/A_apvQkWsVY?si=Un6SqFoQ8pS7Jgst',
  },
  {
    [columnNameToId['Movie Name']]: 'The Martian',
    [columnNameToId['Director']]: 'Ridley Scott',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt3659388/',
    [columnNameToId['Release Year']]: 2015,
    [columnNameToId['Rotten Tomatoes Score']]: '91%',
    [columnNameToId['IMDb Score']]: 8.0,
    [columnNameToId['Duration (Hours)']]: 2.4,
    [columnNameToId['Concise Description']]: 'Stranded astronaut survives Mars using science.',
    [columnNameToId['Awards']]:
      '7 Oscar nominations; Golden Globe (Best Motion Picture – Musical/Comedy)',
    [columnNameToId['Trailer link']]: 'https://www.youtube.com/watch?v=ej3ioOneTy8',
  },
  {
    [columnNameToId['Movie Name']]: 'Blade Runner 2049',
    [columnNameToId['Director']]: 'Denis Villeneuve',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt1856101/',
    [columnNameToId['Release Year']]: 2017,
    [columnNameToId['Rotten Tomatoes Score']]: '88%',
    [columnNameToId['IMDb Score']]: 8.0,
    [columnNameToId['Duration (Hours)']]: 2.7,
    [columnNameToId['Concise Description']]:
      'Futuristic detective hunts replicants in a dystopian LA.',
    [columnNameToId['Awards']]: '2 Oscars (Cinematography, Visual Effects)',
    [columnNameToId['Trailer link']]: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
  },
  {
    [columnNameToId['Movie Name']]: 'Interstellar',
    [columnNameToId['Director']]: 'Christopher Nolan',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt0816692/',
    [columnNameToId['Release Year']]: 2014,
    [columnNameToId['Rotten Tomatoes Score']]: '73%',
    [columnNameToId['IMDb Score']]: 8.7,
    [columnNameToId['Duration (Hours)']]: 2.8,
    [columnNameToId['Concise Description']]:
      'Astronauts search for habitable planets via wormhole.',
    [columnNameToId['Awards']]: 'Oscar (Visual Effects); BAFTA (Special Visual Effects)',
    [columnNameToId['Trailer link']]: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  },
  {
    [columnNameToId['Movie Name']]: 'Ad Astra',
    [columnNameToId['Director']]: 'James Gray',
    [columnNameToId['Imdb link']]: 'https://www.imdb.com/title/tt2935510/',
    [columnNameToId['Release Year']]: 2019,
    [columnNameToId['Rotten Tomatoes Score']]: '83%',
    [columnNameToId['IMDb Score']]: 6.5,
    [columnNameToId['Duration (Hours)']]: 2.1,
    [columnNameToId['Concise Description']]:
      "Astronaut ventures to Neptune to uncover mystery behind his father's failed mission.",
    [columnNameToId['Awards']]: '3 Saturn Award nominations (Best Sci-Fi Film, Actor, Music)',
    [columnNameToId['Trailer link']]: 'https://youtu.be/P6AaSMfXHbA?si=vsHXcIKSAXOgJa0V',
  },
];

export async function createSciFiMoviesTable(userId: string) {
  const name = 'Best Sci-Fi Movies';
  // Create the table with columns
  const sciFiMoviesTable = await Table.create({
    name,
    description: 'A curated list of the best science fiction movies',
    columns: sciFiMoviesColumns,
    userId,
    slug: slugify(name).toLowerCase(),
  });

  // Create rows with the data (already using column IDs)
  const rowPromises = sciFiMoviesData.map((data, index) => {
    return Row.create({
      tableId: sciFiMoviesTable._id,
      data,
      userId,
      index,
    });
  });

  await Promise.all(rowPromises);

  return sciFiMoviesTable;
}
