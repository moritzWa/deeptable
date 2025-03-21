import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from './ui/card';

const examples = [
  {
    category: 'Travel & Lifestyle',
    items: [
      '🏖️ best nomad style beach cities to workcation in Costa Rica close to SFO',
      '🏋️ best gym in Canggu Bali with Sauna and cold plunge',
    ],
  },
  {
    category: 'Business & Investment',
    items: [
      '💼 best vc firms and angel investors for pre-seed companies interested in ai dev tools and ai infra',
      '🚁 founders of eVTOL companies',
      '🎯 startups in the US using GPU infrastructure that might need serverless solutions',
      '🏠 compare investment potential of 3 bedroom properties in Austin TX - ROI, appreciation, rental demand',
    ],
  },
  {
    category: 'Technology & Software',
    items: [
      '⏱️ best time tracking software like Toggl Track',
      '⚛️ Compare React libraries for tables - look at weekly downloads number of GitHub stars and when it was last updated',
      '📊 compare top 5 product management saas - pricing, features, user reviews',
    ],
  },
  {
    category: 'Real Estate & Rentals',
    items: [
      '🏠 2 bed 2 bath apartments in San Francisco for rent, price, modern',
      '🏢 compare coworking spaces in Manhattan - daily rates, amenities, meeting rooms, reviews',
    ],
  },
  {
    category: 'Products & Gadgets',
    items: [
      '🛴 best electric scooters. one wheel drive/two wheel drive, total motor wattage, range, price',
      '📷 best cameras for videography. price, sensor size, lens mount',
    ],
  },
  {
    category: 'Health & Productivity',
    items: [
      '💡 list most knowledgeable person on lights effect on the circadian rhythm, productivity, alertness, etc…',
      '🧘‍♀️ compare top meditation retreats in California - duration, cost, teaching style, accommodation',
    ],
  },
  {
    category: 'Talent Research',
    items: [
      '🏅 find career paths of International Math Olympiad gold medalists from 2015-2020',
      '👩‍💻 research technical leaders who previously worked at Anthropic, OpenAI, or DeepMind',
    ],
  },
];

const ExampleCardsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (prompt: string) => {
    navigate(`/new?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="max-w-5xl mx-auto my-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Try an Example</h1>
      {examples.map((category, idx) => (
        <div key={idx} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{category.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.items.map((item, itemIdx) => (
              <Card
                key={itemIdx}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCardClick(item)}
              >
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{item}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExampleCardsSection;
