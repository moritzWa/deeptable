import { expect, test, describe, beforeEach, afterEach, mock, beforeAll } from "bun:test";
import OpenAI from 'openai';

// Basic test example
test("environment variables", () => {
  expect(process.env.OPENAI_API_KEY).toBeDefined();
});

// // Test group example
// describe("group of tests", () => {
//   test("string operations", () => {
//     const str = "Hello, World!";
//     expect(str.toLowerCase()).toBe("hello, world!");
//     expect(str.split(",")).toEqual(["Hello", " World!"]);
//   });

//   test("array operations", () => {
//     const arr = [1, 2, 3];
//     expect(arr).toContain(2);
//     expect(arr).toHaveLength(3);
//   });
// });

// // Async test example
// test("async operations", async () => {
//   const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
//   const start = Date.now();
//   await delay(100);
//   const end = Date.now();
//   expect(end - start).toBeGreaterThanOrEqual(100);
// });

// // Mock function example
// test("mock function", () => {
//   const mockFn = mock((input: string) => input);
//   mockFn("hello");
//   expect(mockFn).toHaveBeenCalledWith("hello");
//   expect(mockFn).toHaveBeenCalledTimes(1);
// });

// // Setup and teardown example
// describe("setup and teardown", () => {
//   let testData: number[];

//   beforeEach(() => {
//     testData = [1, 2, 3];
//   });

//   afterEach(() => {
//     testData = [];
//   });

//   test("array manipulation", () => {
//     testData.push(4);
//     expect(testData).toEqual([1, 2, 3, 4]);
//   });
// }); 

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  

async function doResearch(question: string) {
    const SYSTEM_PROMPT = `You are a helpful assistant that can search the web for information.`;

    // https://platform.openai.com/docs/guides/tools-web-search?api-mode=chat
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-search-preview",
      web_search_options: {},
      messages: [
        {
          "role": "system",
          "content": SYSTEM_PROMPT
        },
        {
          "role": "user",
          "content": question
        }
      ],
    });
    return completion;
}

describe("Segway Ninebot Max G2 specs", async () => {
const questions = [
    "For the Segway Ninebot Max G2 what is the weight (kg)? Format the response as a number.",
    "For the Segway Ninebot Max G2 what is the maximum range in kilometers? Format the response as a number.",
    "For the Segway Ninebot Max G2 what is the maximum speed in kilometers per hour? Format the response as a number.",
    "For the Segway Ninebot Max G2 what is the drive type (front wheel, rear wheel, or both wheels)? Format the response as one of: 'front', 'rear', or 'both'.",
    
    ];

const [weightResult, rangeResult, speedResult] = await Promise.all(
    questions.map(async (question) => (await doResearch(question)).choices[0].message.content?.trim() ?? "")
  );

  test("weight should be 24.3 kg", () => {
    expect(weightResult).toBe("24.3");
  });

  test("maximum range should be 70 km", () => {
    expect(rangeResult).toBe("70");
  });

  test("maximum speed should be 35 km/h", () => {
    expect(speedResult).toBe("35");
  });
});




