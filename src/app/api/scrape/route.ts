import { NextRequest, NextResponse } from "next/server";

import Groq from "groq-sdk";
import * as cheerio from "cheerio";
import puppeteer from 'puppeteer-extra';


import clonedeep from 'lodash.clonedeep';

export async function POST(req: NextRequest) {
   const request = await req.json();
   
   const url = request.url;
   const response = await scrapeSite(url);
   return NextResponse.json({ success: true, response });
}




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