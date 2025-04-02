import { Column } from '@shared/types';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const hardwareStartupsColumns: Column[] = [
  {
    columnId: randomUUID(),
    name: 'company name',
    type: 'text',
    description: 'Name of the hardware startup company',
  },
  {
    columnId: randomUUID(),
    name: 'company website or crowdfunding compaign',
    type: 'link',
    description: 'URL to company website or crowdfunding page',
  },
  {
    columnId: randomUUID(),
    name: 'year founded',
    type: 'number',
    description: 'Year the company was established',
  },
  {
    columnId: randomUUID(),
    name: 'product name',
    type: 'text',
    description: 'Name of the main product',
  },
  {
    columnId: randomUUID(),
    name: 'extremely concise company description',
    type: 'text',
    description: 'Brief description of what the company does',
  },
  {
    columnId: randomUUID(),
    name: 'funding raised (usd)',
    type: 'text',
    description: 'Total funding raised by the company',
  },
  {
    columnId: randomUUID(),
    name: 'outcome',
    type: 'text',
    description: 'Current status of the company (acquired, private, bankrupt, etc.)',
  },
  {
    columnId: randomUUID(),
    name: 'investors',
    type: 'text',
    description: 'List of investors who funded the company',
  },
  {
    columnId: randomUUID(),
    name: 'founder name',
    type: 'text',
    description: 'Name of the primary founder',
  },
  {
    columnId: randomUUID(),
    name: 'other co-founders',
    type: 'text',
    description: 'Names of additional co-founders',
  },
  {
    columnId: randomUUID(),
    name: 'main founder email',
    type: 'text',
    description: 'Email contact for the primary founder',
  },
  {
    columnId: randomUUID(),
    name: 'main founder x.com account link',
    type: 'link',
    description: "Link to founder's X/Twitter profile",
  },
  {
    columnId: randomUUID(),
    name: 'main founder linkedin account link',
    type: 'link',
    description: "Link to founder's LinkedIn profile",
  },
  {
    columnId: randomUUID(),
    name: 'main founder crunchbase account link',
    type: 'link',
    description: "Link to founder's Crunchbase profile",
  },
];

// Create a mapping of column names to column IDs for data transformation
const columnNameToId = Object.fromEntries(
  hardwareStartupsColumns.map((col) => [col.name, col.columnId])
);

// Transform the hardware startups data to use column IDs instead of names
export const hardwareStartupsData = [
  {
    [columnNameToId['company name']]: 'Pebble Time Smartwatch',
    [columnNameToId['company website or crowdfunding compaign']]:
      'kickstarter.com/projects/getpebble/pebble-time',
    [columnNameToId['year founded']]: 2012,
    [columnNameToId['product name']]: 'Pebble Time Smartwatch',
    [columnNameToId['extremely concise company description']]:
      'Color e-paper smartwatch, long battery life',
    [columnNameToId['funding raised (usd)']]: '20,300,000',
    [columnNameToId['outcome']]: 'Acquired by Fitbit',
    [columnNameToId['investors']]: 'Charles River Ventures',
    [columnNameToId['founder name']]: 'Eric Migicovsky',
    [columnNameToId['other co-founders']]: '',
    [columnNameToId['main founder email']]: '',
    [columnNameToId['main founder x.com account link']]: 'https://x.com/ericmigi?lang=en',
    [columnNameToId['main founder linkedin account link']]: 'https://www.linkedin.com/in/ericmigi/',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/eric-migicovsky',
  },
  {
    [columnNameToId['company name']]: 'Oculus VR',
    [columnNameToId['company website or crowdfunding compaign']]:
      'https://www.kickstarter.com/projects/1523379957/oculus-rift-step-into-the-game',
    [columnNameToId['year founded']]: 2012,
    [columnNameToId['product name']]: 'Oculus Rift',
    [columnNameToId['extremely concise company description']]: 'Virtual Reality Headset',
    [columnNameToId['funding raised (usd)']]: '91,400,000',
    [columnNameToId['outcome']]: 'Acquired by Facebook',
    [columnNameToId['investors']]: 'Andreessen Horowitz, Spark Capital',
    [columnNameToId['founder name']]: 'Palmer Luckey',
    [columnNameToId['other co-founders']]: 'Brendan Iribe, Nate Mitchell, and Michael Antonov',
    [columnNameToId['main founder x.com account link']]: 'https://x.com/palmerluckey?lang=en',
    [columnNameToId['main founder linkedin account link']]:
      'https://www.linkedin.com/in/palmer-luckey-21a16959',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/palmer-luckey',
  },
  {
    [columnNameToId['company name']]: 'Glowforge',
    [columnNameToId['company website or crowdfunding compaign']]: 'glowforge.com',
    [columnNameToId['year founded']]: 2015,
    [columnNameToId['product name']]: 'Glowforge (3D Laser Printer)',
    [columnNameToId['extremely concise company description']]: 'Desktop laser cutter and engraver',
    [columnNameToId['funding raised (usd)']]: '70,000,000',
    [columnNameToId['outcome']]: 'Private',
    [columnNameToId['investors']]: 'Foundry Group, True Ventures',
    [columnNameToId['founder name']]: 'Dan Shapiro',
    [columnNameToId['other co-founders']]: 'Charles Zapata; Brian Schultz',
    [columnNameToId['main founder email']]: 'dan@glowforge.com',
    [columnNameToId['main founder x.com account link']]: 'https://x.com/danshapiro?lang=en',
    [columnNameToId['main founder linkedin account link']]:
      'https://www.linkedin.com/in/danshapiro/',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/dan-shapiro',
  },
  {
    [columnNameToId['company name']]: 'Formlabs',
    [columnNameToId['company website or crowdfunding compaign']]:
      'https://www.kickstarter.com/projects/formlabs/form-1-an-affordable-professional-3d-printer',
    [columnNameToId['year founded']]: 2011,
    [columnNameToId['product name']]: 'Formlabs (3D Printers)',
    [columnNameToId['extremely concise company description']]: 'Desktop SLA 3D printers',
    [columnNameToId['funding raised (usd)']]: '100,000,000',
    [columnNameToId['outcome']]: 'Private',
    [columnNameToId['investors']]: 'New Enterprise Associates, DFJ Growth',
    [columnNameToId['founder name']]: 'Max Lobovsky',
    [columnNameToId['other co-founders']]: 'Natan Linder, David Cranor',
    [columnNameToId['main founder x.com account link']]: 'https://x.com/maxlobovsky?lang=en',
    [columnNameToId['main founder linkedin account link']]:
      'https://www.linkedin.com/in/maxim-lobovsky/',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/maxim-lobovsky',
  },
  {
    [columnNameToId['company name']]: 'Tile',
    [columnNameToId['company website or crowdfunding compaign']]:
      'https://www.kickstarter.com/projects/694835844/pool-tile-by-tile',
    [columnNameToId['year founded']]: 2012,
    [columnNameToId['product name']]: 'Tile (Bluetooth Trackers)',
    [columnNameToId['extremely concise company description']]:
      'Bluetooth tracker for finding lost items',
    [columnNameToId['funding raised (usd)']]: '60,000,000',
    [columnNameToId['outcome']]: 'Private',
    [columnNameToId['investors']]: 'Bessemer Venture Partners, GGVCapital',
    [columnNameToId['founder name']]: 'Mike Farley',
    [columnNameToId['other co-founders']]: 'Nick Evans',
    [columnNameToId['main founder x.com account link']]: 'https://x.com/mikegfarley?lang=en',
    [columnNameToId['main founder linkedin account link']]:
      'https://www.linkedin.com/in/farleymichael/',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/mike-farley-3',
  },
  {
    [columnNameToId['company name']]: 'Eero',
    [columnNameToId['company website or crowdfunding compaign']]:
      'https://app.dealroom.co/companies/eero',
    [columnNameToId['year founded']]: 2014,
    [columnNameToId['product name']]: 'Eero (Wi-Fi Mesh System)',
    [columnNameToId['extremely concise company description']]:
      'Whole-home Wi-Fi mesh networking system',
    [columnNameToId['funding raised (usd)']]: '90,000,000',
    [columnNameToId['outcome']]: 'Acquired by Amazon',
    [columnNameToId['investors']]: 'Menlo Ventures, Index Ventures',
    [columnNameToId['founder name']]: 'Nick Weaver',
    [columnNameToId['other co-founders']]: 'Amos Schallich, Nate Hardison',
    [columnNameToId['main founder x.com account link']]: 'https://x.com/nsweaves?lang=en',
    [columnNameToId['main founder linkedin account link']]: 'https://www.linkedin.com/in/nsweaver/',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/nick-weaver',
  },
  {
    [columnNameToId['company name']]: 'Bragi',
    [columnNameToId['company website or crowdfunding compaign']]: 'bragi.com',
    [columnNameToId['year founded']]: 2013,
    [columnNameToId['product name']]: 'The Dash Wireless Earbuds',
    [columnNameToId['extremely concise company description']]:
      'Truly wireless smart earbuds with activity tracking',
    [columnNameToId['funding raised (usd)']]: '30,000,000',
    [columnNameToId['outcome']]: 'Private',
    [columnNameToId['investors']]: 'Creathor Venture, b-to-v Partners',
    [columnNameToId['founder name']]: 'Nikolaj Hviid',
    [columnNameToId['main founder x.com account link']]:
      'https://x.com/hellobragi/status/841694067150983168',
    [columnNameToId['main founder linkedin account link']]:
      'https://www.linkedin.com/in/nikolaj-hviid-046227/?originalSubdomain=de',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/nikolaj-hviid',
  },
  {
    [columnNameToId['company name']]: 'LIFX',
    [columnNameToId['company website or crowdfunding compaign']]:
      'https://www.kickstarter.com/projects/limemouse/lifx-the-light-bulb-reinvented',
    [columnNameToId['year founded']]: 2012,
    [columnNameToId['product name']]: 'LIFX (Smart Light Bulbs)',
    [columnNameToId['extremely concise company description']]: 'Wi-Fi enabled smart light bulbs',
    [columnNameToId['funding raised (usd)']]: '16,000,000',
    [columnNameToId['outcome']]: 'Acquired by Buddy Technologies',
    [columnNameToId['investors']]: 'Our Innovation Fund, Tencent',
    [columnNameToId['founder name']]: 'Phil Bosua',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/organization/lifx',
  },
  {
    [columnNameToId['company name']]: 'Coolest Cooler',
    [columnNameToId['company website or crowdfunding compaign']]:
      'kickstarter.com/projects/ryangrepper/coolest-cooler-21st-century-cooler-thats-actually',
    [columnNameToId['year founded']]: 2014,
    [columnNameToId['product name']]: 'Coolest Cooler',
    [columnNameToId['extremely concise company description']]:
      'Cooler with built-in blender, Bluetooth speaker, and more',
    [columnNameToId['funding raised (usd)']]: '13,000,000',
    [columnNameToId['outcome']]: 'Bankrupt',
    [columnNameToId['founder name']]: 'Ryan Grepper',
  },
  {
    [columnNameToId['company name']]: 'Daylight',
    [columnNameToId['company website or crowdfunding compaign']]: 'https://daylightcomputer.com/',
    [columnNameToId['product name']]: 'Daylight DC1',
    [columnNameToId['extremely concise company description']]: 'E-Inc tablet',
    [columnNameToId['investors']]: 'Jordi Hays',
    [columnNameToId['founder name']]: 'Patrick Jacquelin',
    [columnNameToId['main founder linkedin account link']]:
      'https://www.linkedin.com/in/patrick-jacquelin-392032144/?originalSubdomain=uk',
  },
  {
    [columnNameToId['company name']]: 'Rorra Countertop System',
    [columnNameToId['company website or crowdfunding compaign']]: 'rorra.com',
    [columnNameToId['year founded']]: 2022,
    [columnNameToId['product name']]: 'Rorra Countertop System',
    [columnNameToId['extremely concise company description']]: 'Water filtration system',
    [columnNameToId['outcome']]: 'Active',
    [columnNameToId['investors']]: 'Groove Capital',
    [columnNameToId['founder name']]: 'Jordi Hays',
    [columnNameToId['other co-founders']]: 'Brian Keller, Charlie Carlisle',
    [columnNameToId['main founder x.com account link']]: 'https://x.com/jordihays?lang=en',
    [columnNameToId['main founder linkedin account link']]:
      'https://www.linkedin.com/in/jordi-hays-559199113/',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/jordi-hays',
  },
  {
    [columnNameToId['company name']]: 'Canary',
    [columnNameToId['company website or crowdfunding compaign']]: 'canary.is',
    [columnNameToId['year founded']]: 2013,
    [columnNameToId['product name']]: 'Canary (Home Security)',
    [columnNameToId['extremely concise company description']]:
      'All-in-one home security device with camera, siren, and sensors',
    [columnNameToId['funding raised (usd)']]: '40,000,000',
    [columnNameToId['outcome']]: 'Private',
    [columnNameToId['investors']]: 'Khosla Ventures, Two Sigma Ventures',
    [columnNameToId['founder name']]: 'Adam Sager',
    [columnNameToId['main founder linkedin account link']]: 'https://www.linkedin.com/in/sager/',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/adam-sager',
  },
  {
    [columnNameToId['company name']]: 'Elio Motors',
    [columnNameToId['company website or crowdfunding compaign']]: 'https://www.eliomotors.com/',
    [columnNameToId['year founded']]: 2009,
    [columnNameToId['product name']]: 'Elio Motor Vehicle',
    [columnNameToId['extremely concise company description']]:
      'A company creating an affordable, high-efficiency three-wheeled vehicle',
    [columnNameToId['outcome']]: 'Active',
    [columnNameToId['founder name']]: 'Paul Elio',
    [columnNameToId['main founder linkedin account link']]:
      'https://www.linkedin.com/in/paul-elio-b425995/',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/paul-elio-2',
  },
  {
    [columnNameToId['company name']]: 'Ouya Game Console',
    [columnNameToId['company website or crowdfunding compaign']]:
      'https://www.kickstarter.com/projects/ouya/ouya-a-new-kind-of-video-game-console/rewards?category_id=270&ref=discovery_category_most_funded&total_hits=1402',
    [columnNameToId['year founded']]: 2012,
    [columnNameToId['product name']]: 'Ouya Game Console',
    [columnNameToId['extremely concise company description']]:
      'A gaming console based on Android with open-source software that encourages development of indie games',
    [columnNameToId['funding raised (usd)']]: '8,600,000',
    [columnNameToId['outcome']]: 'Acquired by Razer in 2015',
    [columnNameToId['investors']]: 'Kleiner Perkins, Maker Media',
    [columnNameToId['founder name']]: 'Julie Uhrman',
    [columnNameToId['other co-founders']]: 'Muffi Ghadiali',
    [columnNameToId['main founder x.com account link']]: 'https://x.com/juhrman?lang=en',
    [columnNameToId['main founder linkedin account link']]:
      'https://www.linkedin.com/in/julieuhrman/',
    [columnNameToId['main founder crunchbase account link']]:
      'https://www.crunchbase.com/person/julie-uhrman',
  },
];

export async function createHardwareStartupsTable(userId: string) {
  const name = 'Consumer Hardware Startups';
  // Create the table with columns
  const hardwareStartupsTable = await Table.create({
    name,
    description: 'List of consumer hardware startups and their products',
    columns: hardwareStartupsColumns,
    userId,
    slug: slugify(name).toLowerCase(),
  });

  // Create rows with the data (already using column IDs)
  const rowPromises = hardwareStartupsData.map((data) => {
    return Row.create({
      tableId: hardwareStartupsTable._id,
      data,
      userId,
    });
  });

  await Promise.all(rowPromises);

  return hardwareStartupsTable;
}
