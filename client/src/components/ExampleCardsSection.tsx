import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from './ui/card';

type ExampleItem = {
  emoji: string;
  text: string;
};

type CategoryExample = {
  category: string;
  items: ExampleItem[];
};

const examples: CategoryExample[] = [
  {
    category: 'Travel & Lifestyle',
    items: [
      {
        emoji: '🏖️',
        text: 'best nomad style beach cities to workcation in Costa Rica close to SFO',
      },
      {
        emoji: '🏋️',
        text: 'best gym in Canggu Bali with Sauna and cold plunge',
      },
    ],
  },
  {
    category: 'Business & Investment',
    items: [
      {
        emoji: '💼',
        text: 'best vc firms and angel investors for pre-seed companies interested in ai dev tools and ai infra',
      },
      {
        emoji: '🚁',
        text: 'founders of eVTOL companies. List company name, main product, regulatory status, and their contact info',
      },
      {
        emoji: '🎯',
        text: 'startups in the US using GPU infrastructure that might need serverless solutions',
      },
      {
        emoji: '🏠',
        text: 'compare investment potential of 3 bedroom properties in Austin TX - ROI, appreciation, rental demand',
      },
    ],
  },
  {
    category: 'Technology & Software',
    items: [
      {
        emoji: '⏱️',
        text: 'best time tracking software like Toggl Track. Look at main pricing, cross platform support, main features, etc.',
      },
      {
        emoji: '⚛️',
        text: 'Compare React libraries for tables - look at weekly downloads number of GitHub stars and when it was last updated',
      },
      {
        emoji: '📊',
        text: 'compare top 5 product management saas - pricing, features, user reviews',
      },
    ],
  },
  {
    category: 'Real Estate & Rentals',
    items: [
      {
        emoji: '🏠',
        text: '2 bed 2 bath apartments in San Francisco for rent, price, modern',
      },
      {
        emoji: '🏢',
        text: 'compare coworking spaces in Manhattan - daily rates, amenities, meeting rooms, reviews',
      },
    ],
  },
  {
    category: 'Products & Gadgets',
    items: [
      {
        emoji: '🛴',
        text: 'best electric scooters. one wheel drive/two wheel drive, total motor wattage, range, price',
      },
      {
        emoji: '📷',
        text: 'best cameras for videography. price, sensor size, lens mount',
      },
    ],
  },
  {
    category: 'Health & Productivity',
    items: [
      {
        emoji: '💡',
        text: 'list most knowledgeable person on lights effect on the circadian rhythm, productivity, alertness, etc…',
      },
      {
        emoji: '🧘‍♀️',
        text: 'compare top meditation retreats in California - duration, cost, teaching style, accommodation',
      },
    ],
  },
  {
    category: 'Talent Research',
    items: [
      {
        emoji: '🏅',
        text: 'find career paths of International Math Olympiad gold medalists from 2015-2020',
      },
      {
        emoji: '👩‍💻',
        text: 'research technical leaders who previously worked at Anthropic, OpenAI, or DeepMind',
      },
    ],
  },
];

const ExampleCardsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (item: ExampleItem) => {
    navigate(`/new?q=${encodeURIComponent(item.emoji + ' ' + item.text)}`);
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
                  <CardTitle className="text-base font-medium flex flex-row gap-4">
                    <span className="text-2xl">{item.emoji}</span>
                    <span>{item.text}</span>
                  </CardTitle>
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
