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
    slug: 'best-ai-spreadsheet-tools',
    title: 'The Best AI-Powered Spreadsheet Tools in 2025',
    description:
      'Discover how AI-powered spreadsheets are revolutionizing data gathering and analysis - from spreadsheet automation to comprehensive web research.',
    date: '2025-04-08',
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
          professional analyzing market trends, or just a curious person comparing products,
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

        <h3>Features</h3>
        <p>
          With DeepTable you can go from a prompt to full table with extreme accuracy. I.e. it will
          not only fill out the cells for you but also help you come up with good column names and
          items to compare. Alternatively you can start with a blank sheet or import an existing
          spreadsheet.
        </p>

        <p>Then simply select the cells you want to fill out and let DeepTable research for you.</p>

        <h2>2. Numerous.ai: The GPT-Formula Extension</h2>

        <img src="/blog/numerous.png" alt="Numerous.ai" width={1000} height={1000} />

        <p>
          For those locked into the Excel/Google Sheets ecosystem, Numerous.ai offers an interesting
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
          With a limit of a few dozen web searches per query, these platforms can't provide the data
          for comprehensive research tasks. It's like having a smart analyst who can only access the
          first few pages of Google - the insights might be valuable, but they're inherently
          limited. As you can see in the screenshot below many cells of the table are blank.
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
  {
    slug: 'best-ai-web-research-tools',
    title: 'Top 5 AI Tools for Automated Web Research',
    description:
      'Compare the top AI-powered web research tools and discover which ones can truly automate your research workflow, from data gathering to analysis.',
    date: '2025-04-15',
    author: 'Team',
    content: (
      <>
        <h2>1. DeepTable</h2>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-lg"
          src="/blog/deeptable.mp4"
        />
        <p>
          DeepTable is a tool that allows you to automate your research workflow. It uses AI to
          gather information from the web and organize it into a spreadsheet. The key difference
          between DeepTable and other tools is that it allows you to go from a prompt to a filled-in
          table by searching the web and using LLMs to fill out the data in your table.
        </p>

        <p>
          It combines the power of LLMs like OpenAI's GPT-4 with the simple interface of a
          spreadsheet to give you direct answers to your research questions in a matter of seconds.
        </p>

        <h2>2. OpenAI Deep Research</h2>
        <p>
          OpenAI Deep Research is a tool designed to automate the process of synthesizing multiple
          web sources into a cohesive answer. It mimics how a researcher might explore a topic,
          aiming to pull insights from across the web and summarize them in natural language.
        </p>

        <img src="/blog/deepresearch.png" alt="OpenAI Deep Research" width={1000} height={1000} />

        <p>
          Its main strength is breadth: it tries to go beyond a single answer and give a more
          nuanced, multi-source perspective. But this comes at the cost of speed, transparency, and
          usability. Responses are often slow, and the tool doesn't always make it easy to trace
          where facts came from. It’s best suited for longform, exploratory research — but often
          overkill for everyday questions and too vague for highly specific ones.
        </p>

        <h2>3. Perplexity</h2>
        <p>
          Perplexity is a fast, general-purpose web assistant that answers questions using real-time
          search results, citing its sources inline. It’s built for users who want quick factual
          answers with links to back them up.
        </p>

        <p>
          Its biggest appeal is responsiveness — answers come fast, and the sources are clearly
          listed. But it tends to prioritize surface-level clarity over depth, and it struggles with
          topics that require judgment, synthesis, or subtlety. Users often rely on it for quick
          summaries or fact checks, but it’s rarely the last stop for deeper work.
        </p>

        <h2>4. Consensus</h2>
        <p>
          Consensus is a search engine that only pulls from peer-reviewed academic literature. When
          you ask a question, it attempts to summarize the scientific consensus — or lack thereof —
          based on relevant studies.
        </p>

        <p>
          It’s useful for health, science, and psychology topics where evidence matters. But its
          narrow data scope means it completely misses broader context or current developments. The
          interface simplifies complex studies, which can be helpful or dangerously reductive,
          depending on the user. Many turn to it for a “science says” headline, but it’s a blunt
          instrument when precision is needed.
        </p>

        <h2>5. Scite</h2>
        <p>
          Scite analyzes academic papers to show how often claims are supported or contradicted in
          other research. It focuses on citation context — not just whether a study is cited, but
          how.
        </p>

        <p>
          The idea is solid: give users a sense of how reliable a claim really is. But in practice,
          it’s easy to misinterpret the citation counts, and the interface can feel dense and
          academic. It’s most useful for literature reviews or academic due diligence, but casual
          users may find it hard to navigate or draw clear conclusions.
        </p>

        <EndOfBlogPostCTASection />
      </>
    ),
  },
  {
    slug: 'best-ai-data-entry-automation-tools',
    title: 'Best AI Tools to Automate Data Entry in 2025',
    description:
      'Discover how AI is revolutionizing data entry - from automated form filling to intelligent document processing. Compare the top tools that are making manual data entry obsolete.',
    date: '2025-04-22',
    author: 'Team',
    content: (
      <>
        <p></p>
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
