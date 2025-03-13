import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from './ui/card';

const examples = [
  {
    category: 'Travel & Lifestyle',
    items: [
      '🏖️ best nomad style beach cities to workcation in costa rica close to sfo',
      '🏋️ best gym in Canggu bali with Sauna and cold plunge'
    ]
  },
  {
    category: 'Business & Investment',
    items: [
      '💼 best vc firms and angel investors for pre-seed companies interested in ai dev tools and ai infra',
      '🚁 founders of evtol companies',
      '🚗 car dealerships us vs germany market size, revenue, and number of dealerships comparison'
    ]
  },
  {
    category: 'Technology & Software',
    items: [
      '⏱️ best time tracking software like toggle tracker',
      '⚛️ Compare react libraries for tables - look at weekly downloads number of github stars and when it was last updated'
    ]
  },
  {
    category: 'Real Estate & Rentals',
    items: [
      '🏠 2 bed 2 bath apartments in san francisco for rent, price, modern'
    ]
  },
  {
    category: 'Products & Gadgets',
    items: [
      '🛴 best electric scooters. one wheel drive/two wheel drive, total motor wattage, range, price',
      '📷 best cameras for videography. price, sensor size, lens mount'
    ]
  },
  {
    category: 'Health & Productivity',
    items: [
      '💡 list most knowledgeable person on lights effect on the circadian rhythm, productivity, alertness, etc…'
    ]
  }
];

const ExampleCardsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (prompt: string) => {
    navigate(`/new?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="max-w-5xl mx-auto my-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Try an Example
      </h1>
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