import { Column } from '@shared/types';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const hardwareStartupsColumns: Column[] = [
  { name: 'company name', type: 'text', description: 'Name of the hardware startup company' },
  { name: 'company website or crodwfunding compaign', type: 'link', description: 'URL to company website or crowdfunding page' },
  { name: 'year founded', type: 'number', description: 'Year the company was established' },
  { name: 'product name', type: 'text', description: 'Name of the main product' },
  { name: 'extremely concise company description', type: 'text', description: 'Brief description of what the company does' },
  { name: 'funding raise', type: 'text', description: 'Amount of funding raised by the company' },
  { name: 'outcome', type: 'text', description: 'Current status of the company (acquired, private, bankrupt, etc.)' },
  { name: 'investors', type: 'text', description: 'List of investors who funded the company' },
  { name: 'founder name', type: 'text', description: 'Name of the primary founder' },
  { name: 'other co-founders', type: 'text', description: 'Names of additional co-founders' },
  { name: 'main founder email', type: 'text', description: 'Email contact for the primary founder' },
  { name: 'main founder x.com account link', type: 'link', description: 'Link to founder\'s X/Twitter profile' },
  { name: 'main founder linkedin account link', type: 'link', description: 'Link to founder\'s LinkedIn profile' },
  { name: 'main founder crunchbase account link', type: 'link', description: 'Link to founder\'s Crunchbase profile' },
];

export const hardwareStartupsData = [
  {
    'company name': 'Pebble Time Smartwatch',
    'company website or crodwfunding compaign': 'kickstarter.com/projects/getpebble/pebble-time',
    'year founded': 2012,
    'product name': 'Pebble Time Smartwatch',
    'extremely concise company description': 'Color e-paper smartwatch, long battery life',
    'funding raise': '20,300,000',
    outcome: 'Acquired by Fitbit',
    investors: 'Charles River Ventures',
    'founder name': 'Eric Migicovsky',
    'other co-founders': '',
    'main founder email': '',
    'main founder x.com account link': 'https://x.com/ericmigi?lang=en',
    'main founder linkedin account link': 'https://www.linkedin.com/in/ericmigi/',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/eric-migicovsky',
  },
  {
    'company name': 'Oculus VR',
    'company website or crodwfunding compaign':
      'https://www.kickstarter.com/projects/1523379957/oculus-rift-step-into-the-game',
    'year founded': 2012,
    'product name': 'Oculus Rift',
    'extremely concise company description': 'Virtual Reality Headset',
    'funding raise': '91,400,000',
    outcome: 'Acquired by Facebook',
    investors: 'Andreessen Horowitz, Spark Capital',
    'founder name': 'Palmer Luckey',
    'other co-founders': 'Brendan Iribe, Nate Mitchell, and Michael Antonov',
    'main founder x.com account link': 'https://x.com/palmerluckey?lang=en',
    'main founder linkedin account link': 'https://www.linkedin.com/in/palmer-luckey-21a16959',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/palmer-luckey',
  },
  {
    'company name': 'Glowforge',
    'company website or crodwfunding compaign': 'glowforge.com',
    'year founded': 2015,
    'product name': 'Glowforge (3D Laser Printer)',
    'extremely concise company description': 'Desktop laser cutter and engraver',
    'funding raise': '70,000,000',
    outcome: 'Private',
    investors: 'Foundry Group, True Ventures',
    'founder name': 'Dan Shapiro',
    'other co-founders': 'Charles Zapata; Brian Schultz',
    'main founder email': 'dan@glowforge.com',
    'main founder x.com account link': 'https://x.com/danshapiro?lang=en',
    'main founder linkedin account link': 'https://www.linkedin.com/in/danshapiro/',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/dan-shapiro',
  },
  {
    'company name': 'Formlabs',
    'company website or crodwfunding compaign':
      'https://www.kickstarter.com/projects/formlabs/form-1-an-affordable-professional-3d-printer',
    'year founded': 2011,
    'product name': 'Formlabs (3D Printers)',
    'extremely concise company description': 'Desktop SLA 3D printers',
    'funding raise': '100,000,000',
    outcome: 'Private',
    investors: 'New Enterprise Associates, DFJ Growth',
    'founder name': 'Max Lobovsky',
    'other co-founders': 'Natan Linder, David Cranor',
    'main founder x.com account link': 'https://x.com/maxlobovsky?lang=en',
    'main founder linkedin account link': 'https://www.linkedin.com/in/maxim-lobovsky/',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/maxim-lobovsky',
  },
  {
    'company name': 'Tile',
    'company website or crodwfunding compaign':
      'https://www.kickstarter.com/projects/694835844/pool-tile-by-tile',
    'year founded': 2012,
    'product name': 'Tile (Bluetooth Trackers)',
    'extremely concise company description': 'Bluetooth tracker for finding lost items',
    'funding raise': '60,000,000',
    outcome: 'Private',
    investors: 'Bessemer Venture Partners, GGVCapital',
    'founder name': 'Mike Farley',
    'other co-founders': 'Nick Evans',
    'main founder x.com account link': 'https://x.com/mikegfarley?lang=en',
    'main founder linkedin account link': 'https://www.linkedin.com/in/farleymichael/',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/mike-farley-3',
  },
  {
    'company name': 'Eero',
    'company website or crodwfunding compaign': 'https://app.dealroom.co/companies/eero',
    'year founded': 2014,
    'product name': 'Eero (Wi-Fi Mesh System)',
    'extremely concise company description': 'Whole-home Wi-Fi mesh networking system',
    'funding raise': '90,000,000',
    outcome: 'Acquired by Amazon',
    investors: 'Menlo Ventures, Index Ventures',
    'founder name': 'Nick Weaver',
    'other co-founders': 'Amos Schallich ,Nate Hardison',
    'main founder x.com account link': 'https://x.com/nsweaves?lang=en',
    'main founder linkedin account link': 'https://www.linkedin.com/in/nsweaver/',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/nick-weaver',
  },
  {
    'company name': 'Bragi',
    'company website or crodwfunding compaign': 'bragi.com',
    'year founded': 2013,
    'product name': 'The Dash Wireless Earbuds',
    'extremely concise company description': 'Truly wireless smart earbuds with activity tracking',
    'funding raise': '30,000,000',
    outcome: 'Private',
    investors: 'Creathor Venture, b-to-v Partners',
    'founder name': 'Nikolaj Hviid',
    'main founder x.com account link': 'https://x.com/hellobragi/status/841694067150983168',
    'main founder linkedin account link':
      'https://www.linkedin.com/in/nikolaj-hviid-046227/?originalSubdomain=de',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/nikolaj-hviid',
  },
  {
    'company name': 'LIFX',
    'company website or crodwfunding compaign':
      'https://www.kickstarter.com/projects/limemouse/lifx-the-light-bulb-reinvented',
    'year founded': 2012,
    'product name': 'LIFX (Smart Light Bulbs)',
    'extremely concise company description': 'Wi-Fi enabled smart light bulbs',
    'funding raise': '16,000,000',
    outcome: 'Acquired by Buddy Technologies',
    investors: 'Our Innovation Fund, Tencent',
    'founder name': 'Phil Bosua',
    'main founder crunchbase account link': 'https://www.crunchbase.com/organization/lifx',
  },
  {
    'company name': 'Coolest Cooler',
    'company website or crodwfunding compaign':
      'kickstarter.com/projects/ryangrepper/coolest-cooler-21st-century-cooler-thats-actually',
    'year founded': 2014,
    'product name': 'Coolest Cooler',
    'extremely concise company description':
      'Cooler with built-in blender, Bluetooth speaker, and more',
    'funding raise': '13,000,000',
    outcome: 'Bankrupt',
    'founder name': 'Ryan Grepper',
  },
  {
    'company name': 'Daylight',
    'company website or crodwfunding compaign': 'https://daylightcomputer.com/',
    'product name': '',
    'extremely concise company description': 'E-Inc tablet',
    investors: 'Jordi Hays',
    'founder name': 'Patrick Jacquelin',
    'main founder linkedin account link':
      'https://www.linkedin.com/in/patrick-jacquelin-392032144/?originalSubdomain=uk',
  },
  {
    'company name': 'Rorra Countertop System',
    'company website or crodwfunding compaign': 'rorra.com',
    'year founded': 2022,
    'product name': 'Rorra Countertop System',
    'extremely concise company description': 'Water filtration system',
    outcome: 'Active',
    investors: 'Groove Capital',
    'founder name': 'Jordi Hays',
    'other co-founders': 'Brian Keller, Charlie Carlisle',
    'main founder x.com account link': 'https://x.com/jordihays?lang=en',
    'main founder linkedin account link': 'https://www.linkedin.com/in/jordi-hays-559199113/',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/jordi-hays',
  },
  {
    'company name': 'Canary',
    'company website or crodwfunding compaign': 'canary.is',
    'year founded': 2013,
    'product name': 'Canary (Home Security)',
    'extremely concise company description':
      'All-in-one home security device with camera, siren, and sensors',
    'funding raise': '40,000,000',
    outcome: 'Private',
    investors: 'Khosla Ventures, Two Sigma Ventures',
    'founder name': 'Adam Sager',
    'main founder linkedin account link': 'https://www.linkedin.com/in/sager/',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/adam-sager',
  },
  {
    'company name': 'Elio Motors',
    'company website or crodwfunding compaign': 'Elio Motors',
    'year founded': 2009,
    'product name': 'Elio Motor Vehicle',
    'extremely concise company description':
      'A company creating an affordable, high-efficiency three-wheeled vehicle',
    outcome: 'Active',
    'founder name': 'Paul Elio',
    'main founder linkedin account link': 'https://www.linkedin.com/in/paul-elio-b425995/',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/paul-elio-2',
  },
  {
    'company name': 'Ouya Game Console',
    'company website or crodwfunding compaign':
      'https://www.kickstarter.com/projects/ouya/ouya-a-new-kind-of-video-game-console/rewards?category_id=270&ref=discovery_category_most_funded&total_hits=1402',
    'year founded': 2012,
    'product name': 'Ouya Game Console',
    'extremely concise company description':
      'A gaming console based on Android with open-source software that encourages development of indie games',
    'funding raise': '8,600,000',
    outcome: 'Acquired by Razer in 2015',
    investors: 'Kleiner Perkins, Maker Media',
    'founder name': 'Julie Uhrman',
    'other co-founders': 'Muffi Ghadiali',
    'main founder x.com account link': 'https://x.com/juhrman?lang=en',
    'main founder linkedin account link': 'https://www.linkedin.com/in/julieuhrman/',
    'main founder crunchbase account link': 'https://www.crunchbase.com/person/julie-uhrman',
  },
];

export async function createHardwareStartupsTable(userId: string) {
  // Create the table with columns
  const hardwareStartupsTable = await Table.create({
    name: 'Consumer Hardware Startups',
    description: 'List of successful consumer hardware startups, their founders, and investors',
    columns: hardwareStartupsColumns,
    userId,
  });

  // Create rows
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
