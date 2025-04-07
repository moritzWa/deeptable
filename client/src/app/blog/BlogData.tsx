import { EndOfBlogPostCTASection } from '@/components/EndOfBlogPostCTASection';

import { JSX } from 'react';

export interface BlogPostMetadata {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  content: JSX.Element;
}

// Notes on what to write about in the future (don't delete this)
// - the insights of hiring contributors https://philipwalton.com/articles/how-to-find-qualified-developers/
// - mention passive sourcing

export const blogPosts: BlogPostMetadata[] = [
  {
    slug: 'best-ai-spreadsheet-research-tools',
    title: 'The Best AI Spreadsheet and Research Tools in 2025',
    description:
      'Discover how AI-powered research tools are revolutionizing data gathering and analysis - from spreadsheet automation to comprehensive web research.',
    date: '2024-03-21',
    author: 'Team',
    content: (
      <>
        <p>
          In the fast-paced world of business and research, staying ahead means having the right
          tools at your disposal. The emergence of AI-powered research solutions has transformed how
          we gather and analyze data, but not all tools are created equal. Let's dive into the most
          powerful options available today and see how they stack up.
        </p>

        <h2>The Evolution of AI Research Tools</h2>
        <p>
          Remember the days of manually copying data into spreadsheets and spending countless hours
          verifying information? Those days are rapidly becoming history. Today's AI-powered tools
          can automate these processes, but choosing the right solution for your needs is crucial.
        </p>

        <h2>1. DeepTable: Redefining Research Automation</h2>
        <p>
          Imagine having a research assistant that never sleeps, consistently delivers accurate
          results, and organizes everything perfectly. That's what DeepTable brings to the table.
          Whether you're a venture capitalist researching potential investments, a real estate
          professional analyzing market trends, or a talent recruiter tracking industry movements,
          DeepTable transforms complex research tasks into streamlined processes.
        </p>

        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-lg"
          src="/blog/deeptable.mp4"
        />

        <p>
          What sets DeepTable apart is its ability to handle diverse research scenarios. Need to
          find the best beach cities for digital nomads? Looking for technical leaders from top AI
          companies? Or perhaps analyzing investment opportunities in specific markets? DeepTable
          handles it all with remarkable precision.
        </p>

        <h2>2. Numerous.ai: The GPT-Formula Extension</h2>

        <img src="/blog/numerous.png" alt="Numerous.ai" width={1000} height={1000} />

        <p>
          For those deeply embedded in the Excel ecosystem, Numerous.ai offers an interesting
          proposition. It brings AI capabilities directly into your spreadsheet environment, which
          sounds perfect on paper. However, there's more to consider.
        </p>

        <p>
          While Numerous.ai excels at processing existing data within your spreadsheets, it faces
          limitations when it comes to gathering new information. Users need to provide their own
          data and craft specific prompts for analysis. Think of it as having a powerful calculator
          without the ability to gather the numbers you need to crunch.
        </p>

        <h2>3. Talonic: The Data Structure Specialist</h2>
        <p>
          Talonic takes a specialized approach to data management, focusing on transforming
          unstructured documents into clean, organized datasets. With powerful AI-driven extraction
          capabilities and enterprise-grade security options, it excels at processing internal
          documents like PDFs and Excel files.
        </p>

        <img src="/blog/talonic.png" alt="Talonic" width={1000} height={1000} />

        <p>
          However, like Numerous.ai, Talonic's focus is on processing existing data rather than
          gathering new information. While it's excellent for organizing internal documents and
          streamlining data workflows, it's not designed for web research or real-time data
          gathering. Think of it as an efficient data librarian that can organize your existing
          information but can't help you discover new sources.
        </p>

        <h2>4. Perplexity and Other Research Platforms</h2>
        <p>
          The latest generation of AI research platforms, like Perplexity, offers an intriguing
          approach to data gathering and presentation. They excel at creating well-formatted reports
          and can even generate data tables. However, their research capabilities hit a ceiling
          pretty quickly.
        </p>

        <p>
          With limits of 12-200 web searches per query, these platforms often struggle to provide
          the comprehensive data needed for serious research tasks. It's like having a brilliant
          analyst who can only access the first few pages of Google - the insights might be
          valuable, but they're inherently limited.
        </p>

        <img src="/blog/perplexity.png" alt="Perplexity" width={1000} height={1000} />

        <h2>5. Google Sheets: The Gemini Integration</h2>
        <p>
          Google's integration of Gemini AI into Sheets presents an interesting addition to the
          spreadsheet landscape. While it excels at formula generation and basic table creation, the
          implementation has notable limitations.
        </p>

        <p>
          The strengths lie in its ability to handle complex formulas effortlessly and create basic
          tables on demand. However, when it comes to comprehensive data analysis or filling out
          large data tables, the functionality falls short. The pricing model also raises eyebrows -
          requiring a Google One AI Premium subscription at $20/month makes it one of the more
          expensive options for spreadsheet automation.
        </p>

        <img
          src="/blog/googlesheets.gif"
          alt="Google Sheets Gemini Integration Demo"
          width={1000}
          height={1000}
          className="w-full rounded-lg"
        />

        <p>
          While the integration shows promise, its current state feels more like a helpful add-on
          rather than a complete research solution. Users looking for comprehensive data gathering
          and analysis capabilities might find the limitations frustrating.
        </p>

        <h2>Why DeepTable Stands Out</h2>
        <p>
          What makes DeepTable different is its comprehensive approach to research automation.
          Unlike tools that either focus solely on spreadsheet manipulation or provide limited
          research capabilities, DeepTable bridges the gap between data gathering and organization.
        </p>

        <p>Consider these real-world applications:</p>
        <ul>
          <li>
            Business Intelligence: Track competitor movements, market trends, and investment
            opportunities with unprecedented depth
          </li>
          <li>
            Real Estate Analysis: Compare properties, analyze market conditions, and identify
            investment opportunities across multiple locations
          </li>
          <li>
            Talent Research: Track career paths of industry leaders, identify emerging talent, and
            map professional networks
          </li>
          <li>
            Technology Research: Compare software solutions, track industry developments, and
            analyze market adoption trends
          </li>
        </ul>

        <h2>Making the Right Choice</h2>
        <p>
          When choosing an AI research tool, consider your specific needs. If you're primarily
          working with existing data in Excel, Numerous.ai might be sufficient. If you need quick,
          surface-level research, platforms like Perplexity could work.
        </p>

        <p>
          However, if you need comprehensive research capabilities combined with intelligent data
          organization, DeepTable offers the most complete solution. And the best part? You can try
          it for free and experience the difference yourself.
        </p>

        <h2>Ready to Transform Your Research Process?</h2>
        <p>
          Don't let manual research hold you back. Start your free trial with DeepTable today and
          discover how AI-powered research can revolutionize your workflow. Your next breakthrough
          insight is just a search away.
        </p>

        <EndOfBlogPostCTASection />
      </>
    ),
  },
  // {
  //   slug: 'quick-start-guide',
  //   title: 'Quick Start Guide',
  //   description: 'Get started with our platform in minutes',
  //   date: '2024-05-01',
  //   author: 'Team',
  //   content: (
  //     <>
  //       <p>Hello world</p>
  //     </>
  //   ),
  // },
  // {
  //   slug: 'about-deep-table',
  //   title: 'About Deep Table',
  //   description: 'Learn more about our AI-powered platform',
  //   date: '2024-05-02',
  //   author: 'Team',
  //   content: (
  //     <>
  //       <p>Hello world</p>
  //     </>
  //   ),
  // },
  // {
  //   slug: 'new-updates',
  //   title: 'New Updates',
  //   description: 'Check out the latest features and improvements',
  //   date: '2024-05-03',
  //   author: 'Team',
  //   content: (
  //     <>
  //       <p>Hello world</p>
  //     </>
  //   ),
  // },
  // {
  //   slug: 'help-center',
  //   title: 'Help Center',
  //   description: 'Find answers to common questions and issues',
  //   date: '2024-05-04',
  //   author: 'Team',
  //   content: (
  //     <>
  //       <p>Hello world</p>
  //     </>
  //   ),
  // },
  // {
  //   slug: 'free-trial-available',
  //   title: 'Free Trial Available',
  //   description: 'Try our premium features at no cost',
  //   date: '2024-05-05',
  //   author: 'Team',
  //   content: (
  //     <>
  //       <p>Hello world</p>
  //     </>
  //   ),
  // },
];

export const getBlogPostBySlug = (slug: string) => {
  return blogPosts.find((post) => post.slug === slug);
};
