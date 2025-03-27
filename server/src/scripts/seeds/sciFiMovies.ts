import { Column } from '@shared/types';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const sciFiMoviesColumns: Column[] = [
  { name: 'Movie Name', type: 'text', description: 'Name of the sci-fi movie' },
  { name: 'Director', type: 'text', description: 'Director of the movie' },
  { name: 'Imdb link', type: 'link', description: 'Link to the movie on IMDB' },
  { name: 'Release Year', type: 'number', description: 'Year the movie was released' },
  { name: 'Rotten Tomatoes Score', type: 'text', description: 'Rating on Rotten Tomatoes' },
  { name: 'IMDb Score', type: 'number', description: 'Rating on IMDB' },
  { name: 'Duration (Hours)', type: 'number', description: 'Movie length in hours' },
  { name: 'Concise Description', type: 'text', description: 'Brief summary of the movie plot' },
  { name: 'Awards', type: 'text', description: 'Major awards won by the movie' },
  { name: 'Trailer link', type: 'link', description: 'Link to the official trailer' },
];

export const sciFiMoviesData = [
  {
    'Movie Name': 'Advantageous (2015)',
    Director: 'Jennifer Phang',
    'Imdb link': 'https://www.imdb.com/title/tt4056636/',
    'Release Year': 2015,
    'Rotten Tomatoes Score': '88%',
    'IMDb Score': 6.2,
    'Duration (Hours)': 1.5,
    'Concise Description':
      "Mother transfers consciousness into younger body to secure daughter's future.",
    Awards: 'Sundance Award (Grand Jury Prize)',
    'Trailer link': 'https://youtu.be/jnBT0izYi7A?si=7h-54NWynRQsi5gp',
  },
  {
    'Movie Name': 'Upgrade (2018)',
    Director: 'Leigh Whannell',
    'Imdb link': 'https://www.imdb.com/title/tt6498658/',
    'Release Year': 2018,
    'Rotten Tomatoes Score': '88%',
    'IMDb Score': 7.5,
    'Duration (Hours)': 1.7,
    'Concise Description': 'Paralyzed man gains revenge via AI implant in dystopian thriller.',
    Awards: 'Saturn Award nomination (Best Sci-Fi Film)',
    'Trailer link': 'https://youtu.be/36PDeN9NRZ0?si=ASN2bjbrswJzhMv1',
  },
  {
    'Movie Name': 'Appleseed (2004)',
    Director: 'Shinji Aramaki',
    'Imdb link': 'https://www.imdb.com/title/tt0401237/',
    'Release Year': 2004,
    'Rotten Tomatoes Score': '60%',
    'IMDb Score': 6.9,
    'Duration (Hours)': 1.7,
    'Concise Description': 'Post-apocalyptic sci-fi with cyborg soldiers and existential themes.',
    Awards: '',
    'Trailer link': 'https://youtu.be/j17h7gBFOzI?si=C0acePrV_1mEH_lK',
  },
  {
    'Movie Name': 'Ghost in the Shell (2017)',
    Director: 'Rupert Sanders',
    'Imdb link': 'https://www.imdb.com/title/tt1219827/',
    'Release Year': 2017,
    'Rotten Tomatoes Score': '43%',
    'IMDb Score': 6.3,
    'Duration (Hours)': 1.8,
    'Concise Description': 'Cyber-enhanced agent uncovers conspiracy in dystopian future.',
    Awards: '',
    'Trailer link': 'https://youtu.be/tRkb1X9ovI4?si=jKlmccFzEoNZTOVs',
  },
  {
    'Movie Name': 'Proxima (2019)',
    Director: 'Alice Winocour',
    'Imdb link': 'https://www.imdb.com/title/tt8917938/',
    'Release Year': 2019,
    'Rotten Tomatoes Score': '85%',
    'IMDb Score': 6.4,
    'Duration (Hours)': 1.8,
    'Concise Description': 'Astronaut balances mission to Mars with motherhood.',
    Awards: "Cannes Film Festival (Directors' Fortnight)",
    'Trailer link': 'https://youtu.be/8SFhBakU7A0?si=6bd_mhjgA8Xn6gt4',
  },
  {
    'Movie Name': 'Ex Machina',
    Director: 'Alex Garland',
    'Imdb link': 'https://www.imdb.com/title/tt0470752/',
    'Release Year': 2014,
    'Rotten Tomatoes Score': '92%',
    'IMDb Score': 7.7,
    'Duration (Hours)': 1.8,
    'Concise Description': 'Programmer evaluates humanoid AI in psychological thriller.',
    Awards: 'Oscar (Best Visual Effects); BAFTA nomination (Best Original Screenplay)',
    'Trailer link': 'https://www.youtube.com/watch?v=gyKqHOgMi4g',
  },
  {
    'Movie Name': 'Metropolis (2001)',
    Director: 'Rintaro',
    'Imdb link': 'https://www.imdb.com/title/tt0293416/',
    'Release Year': 2001,
    'Rotten Tomatoes Score': '86%',
    'IMDb Score': 7.4,
    'Duration (Hours)': 1.8,
    'Concise Description':
      "Anime adaptation of Fritz Lang's classic, blending cyberpunk and social critique.",
    Awards: '',
    'Trailer link': 'https://youtu.be/aen2v31UjqA?si=VQ7q_c_yxY-rGWiv',
  },
  {
    'Movie Name': 'Arrival',
    Director: 'Denis Villeneuve',
    'Imdb link': 'https://www.imdb.com/title/tt2543164/',
    'Release Year': 2016,
    'Rotten Tomatoes Score': '94%',
    'IMDb Score': 7.9,
    'Duration (Hours)': 1.9,
    'Concise Description': 'Linguist deciphers alien language to prevent global crisis.',
    Awards: 'Oscar (Sound Editing); BAFTA nomination (Best Director)',
    'Trailer link': 'https://www.youtube.com/watch?v=tFMo3UJ4B4g',
  },
  {
    'Movie Name': 'Stowaway (2021)',
    Director: 'Joe Penna',
    'Imdb link': 'https://www.imdb.com/title/tt9253284/',
    'Release Year': 2021,
    'Rotten Tomatoes Score': '51%',
    'IMDb Score': 5.6,
    'Duration (Hours)': 1.9,
    'Concise Description': 'Crew discovers stowaway on Mars mission, forcing ethical decisions.',
    Awards: '',
    'Trailer link': 'https://youtu.be/A_apvQkWsVY?si=Un6SqFoQ8pS7Jgst',
  },
  {
    'Movie Name': 'The Martian',
    Director: 'Ridley Scott',
    'Imdb link': 'https://www.imdb.com/title/tt3659388/',
    'Release Year': 2015,
    'Rotten Tomatoes Score': '91%',
    'IMDb Score': 8.0,
    'Duration (Hours)': 2.4,
    'Concise Description': 'Stranded astronaut survives Mars using science.',
    Awards: '7 Oscar nominations; Golden Globe (Best Motion Picture – Musical/Comedy)',
    'Trailer link': 'https://www.youtube.com/watch?v=ej3ioOneTy8',
  },
  {
    'Movie Name': 'Blade Runner 2049',
    Director: 'Denis Villeneuve',
    'Imdb link': 'https://www.imdb.com/title/tt1856101/',
    'Release Year': 2017,
    'Rotten Tomatoes Score': '88%',
    'IMDb Score': 8.0,
    'Duration (Hours)': 2.7,
    'Concise Description': 'Futuristic detective hunts replicants in a dystopian LA.',
    Awards: '2 Oscars (Cinematography, Visual Effects)',
    'Trailer link': 'https://www.youtube.com/watch?v=gCcx85zbxz4',
  },
  {
    'Movie Name': 'Interstellar',
    Director: 'Christopher Nolan',
    'Imdb link': 'https://www.imdb.com/title/tt0816669/',
    'Release Year': 2014,
    'Rotten Tomatoes Score': '73%',
    'IMDb Score': 8.7,
    'Duration (Hours)': 2.8,
    'Concise Description': 'Astronauts search for habitable planets via wormhole.',
    Awards: 'Oscar (Visual Effects); BAFTA (Special Visual Effects)',
    'Trailer link': 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  },
  {
    'Movie Name': 'Ad Astra',
    Director: 'James Gray',
    'Imdb link': 'https://www.imdb.com/title/tt2096673/',
    'Release Year': 2019,
    'Rotten Tomatoes Score': '83%',
    'IMDb Score': 6.5,
    'Duration (Hours)': 2.1,
    'Concise Description':
      "Astronaut ventures to Neptune to uncover mystery behind his father's failed mission.",
    Awards: '3 Saturn Award nominations (Best Sci-Fi Film, Actor, Music)',
    'Trailer link': 'https://youtu.be/P6AaSMfXHbA?si=vsHXcIKSAXOgJa0V',
  },
];

export async function createSciFiMoviesTable(userId: string) {
  // Create the table with columns
  const sciFiMoviesTable = await Table.create({
    name: 'Sci-Fi Movies Collection',
    description: 'Sci-fi movies like the Martian or Ghost in the Shell',
    columns: sciFiMoviesColumns,
    userId,
  });

  // Create rows
  const rowPromises = sciFiMoviesData.map((data) => {
    return Row.create({
      tableId: sciFiMoviesTable._id,
      data,
      userId,
    });
  });

  await Promise.all(rowPromises);

  return sciFiMoviesTable;
}
