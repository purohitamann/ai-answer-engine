import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Groq from "groq-sdk";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";


import clonedeep from 'lodash.clonedeep';
// Initialize Groq with API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * POST handler for the API route.
 * Accepts user queries, interacts with Groq, and performs web scraping.
 */
export async function POST(req: NextRequest) {
  try {
  
    const { question , url} = await req.json();
   
    const chatCompletion = await getGroqChatCompletion(question,url);

    // Perform web scraping to enrich the response
    // const scrapedData = await performWebScraping(query);

    // Consolidate the Groq response and scraped data
    const finalResponse = {
      response: chatCompletion.choices[0]?.message?.content || "No response from Groq",
      // scrapedData,
    };
    console.log(finalResponse);

    // Return the consolidated response
    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request." },
      { status: 500 }
    );
  }
}

/**
 * Calls the Groq LLM API to get a chat completion based on the query.
 */
export async function getGroqChatCompletion(query: string, url: string) {
  const sources = await scrapeSite(url);
  const prompt = `
  You are an expert web assistant. Using the context provided below, answer the question comprehensively while citing the sources from the context. 
  
  If relevant information is not directly available in the context, incorporate your broader knowledge to provide a well-rounded response. Ensure your answer is concise, accurate, and informative.
  
  
  **Instructions:**
  1. Base your response primarily on the provided context. 
  2. Always cite the sources from the context where applicable.
  3. If the context lacks sufficient details, supplement your answer with additional relevant knowledge.
  4. At the end of your response, include at least two credible online resources as references to validate your answer. provide url to the source. this is very important!!
  
  Your goal is to provide a clear and actionable response that is easy to understand. Avoid stating that there is insufficient context; instead, focus on delivering value.
  `;
  
  const userInputs = `Context: ${sources} Question: ${query}`;

  return await groq.chat.completions.create({
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: userInputs },
    ],
    model: "llama3-8b-8192", // Ensure you use the appropriate model
  });
}

/**
 * Performs web scraping using Puppeteer and Cheerio based on the user's query.
 */


export async function scrapeSite(url: string) {
  try {
      if (!/^https?:\/\//.test(url)) {
          throw new Error(`Invalid URL: ${url}`);
      }

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
      );

      console.log(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });

      const textContent = await page.evaluate(() => document.body.innerText);

      await browser.close();

      return textContent.trim();
  } catch (error) {
      console.error('Error during scraping:', error.message);
      return `Error: ${error.message}`;
  }
}