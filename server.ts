import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

interface ServerSeoEntry {
  title: string;
  description: string;
  priority: string;
  changefreq: string;
}

const SERVER_SEO_ROUTES: Record<string, ServerSeoEntry> = {
  '/': {
    title: 'Umm-e-Aiman – Girls Hostel Jhang & Paramedical Institute Bhowana',
    description:
      'Explore comfortable female student accommodation at Umm-e-Aiman Girls Hostel in Jhang and healthcare diploma programs at Umm-e-Aiman Paramedical Institute in Bhowana.',
    priority: '1.0',
    changefreq: 'weekly',
  },
  '/about': {
    title: 'About Umm-e-Aiman – Girls Hostel & Paramedical Institute',
    description:
      'Learn how Umm-e-Aiman serves students in Punjab through dedicated female student housing in Jhang and practical healthcare training in Bhowana, District Chiniot.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  '/contact': {
    title: 'Contact Umm-e-Aiman – Jhang Hostel & Bhowana Institute',
    description:
      'Direct phone numbers, WhatsApp links, and branch directions for Umm-e-Aiman Girls Hostel in Jhang and Umm-e-Aiman Paramedical Institute in Bhowana.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  '/girls-hostel': {
    title: 'Umm-e-Aiman Girls Hostel in Jhang – Student Accommodation',
    description:
      'Welcome to Umm-e-Aiman Girls Hostel in Jhang (Satellite Town & Lalazar). Safe female student rooms, 24-hour security, CCTV, meals, Wi-Fi, and study environment.',
    priority: '0.95',
    changefreq: 'weekly',
  },
  '/girls-hostel/facilities': {
    title: 'Hostel Facilities – Umm-e-Aiman Girls Hostel in Jhang',
    description:
      'Explore 14 essential student amenities at Umm-e-Aiman Girls Hostel Jhang: 24-hour security, CCTV, Wi-Fi, meals, filtered water, geyser, and study atmosphere.',
    priority: '0.85',
    changefreq: 'monthly',
  },
  '/girls-hostel/rooms-pricing': {
    title: 'Rooms & Monthly Pricing – Umm-e-Aiman Girls Hostel Jhang',
    description:
      'View advertised student accommodation rates in Jhang: 3-person sharing (PKR 15,000), 2-person sharing (PKR 12,000), without food (PKR 7,000), and deposit details.',
    priority: '0.9',
    changefreq: 'weekly',
  },
  '/girls-hostel/gallery': {
    title: 'Gallery & Information Plates – Umm-e-Aiman Girls Hostel',
    description:
      'Browse accommodation tariff schedules, Satellite Town and Lalazar branch guides, security overviews, and hostel information plates for Jhang students.',
    priority: '0.75',
    changefreq: 'monthly',
  },
  '/girls-hostel/rules': {
    title: 'Hostel Rules & Regulations – Umm-e-Aiman Girls Hostel Jhang',
    description:
      'Read the official 8 residence rules for Umm-e-Aiman Girls Hostel in Jhang, including the PKR 3,000 deposit, 9:00 PM entry policy, and monthly dues schedule.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  '/girls-hostel/booking': {
    title: 'Room Booking Inquiry – Umm-e-Aiman Girls Hostel Jhang',
    description:
      'Submit an online room accommodation inquiry or WhatsApp request for Umm-e-Aiman Girls Hostel in Satellite Town or Lalazar, Jhang.',
    priority: '0.9',
    changefreq: 'weekly',
  },
  '/paramedical-institute': {
    title: 'Umm-e-Aiman Paramedical Institute Bhowana – Medical Diplomas',
    description:
      'Explore healthcare education and medical diploma courses at Umm-e-Aiman Paramedical Institute on Ameenpur Road, Bhowana, District Chiniot.',
    priority: '0.95',
    changefreq: 'weekly',
  },
  '/paramedical-institute/courses': {
    title: 'Medical Diploma Courses – Umm-e-Aiman Paramedical Institute',
    description:
      'Discover Dispenser, MLT, OTT, Radiography, Pharmacy Technician, LHV, CNA, and CMW courses at Umm-e-Aiman Paramedical Institute in Bhowana, Chiniot.',
    priority: '0.9',
    changefreq: 'weekly',
  },
  '/paramedical-institute/admissions': {
    title: 'Admissions & Online Application – Umm-e-Aiman Institute',
    description:
      'Check Matric Science (45% minimum marks) eligibility, required documents, and submit your online admission application to Umm-e-Aiman Paramedical Institute.',
    priority: '0.9',
    changefreq: 'weekly',
  },
  '/paramedical-institute/facilities': {
    title: 'Laboratories & Campus Facilities – Umm-e-Aiman Institute',
    description:
      'Tour our Medical Laboratory, Pharmacy Lab, Demonstration Rooms, Classrooms, and Library at Umm-e-Aiman Paramedical Institute in Bhowana.',
    priority: '0.85',
    changefreq: 'monthly',
  },
  '/paramedical-institute/gallery': {
    title: 'Campus Photos, Posters & Video – Umm-e-Aiman Institute',
    description:
      'View real laboratory photographs, campus office visuals, official prospectus posters, and the promotional video of Umm-e-Aiman Paramedical Institute.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  '/paramedical-institute/contact': {
    title: 'Institute Contact & Campus Location – Bhowana, Chiniot',
    description:
      'Contact Chief Executive numbers 0333-8985588 and 0334-7727235 or get directions to Ameenpur Road, Bhowana, District Chiniot.',
    priority: '0.85',
    changefreq: 'monthly',
  },
  '/faq': {
    title: 'Frequently Asked Questions – Umm-e-Aiman Hostel & Institute',
    description:
      'Answers to common questions about Jhang hostel room rates, curfews, Bhowana paramedical diploma eligibility, required documents, and application review.',
    priority: '0.75',
    changefreq: 'monthly',
  },
  '/privacy-policy': {
    title: 'Privacy Policy – Umm-e-Aiman Girls Hostel & Institute',
    description:
      'How Umm-e-Aiman protects student accommodation inquiries, admission records, CNIC/B-Form attachments, and guardian contact details.',
    priority: '0.5',
    changefreq: 'yearly',
  },
  '/terms': {
    title: 'Terms and Conditions – Umm-e-Aiman Official Website',
    description:
      'Terms governing online hostel inquiries, paramedical admission submissions, promotional rate confirmations, and website usage.',
    priority: '0.5',
    changefreq: 'yearly',
  },
  '/media-studio': {
    title: 'Promotional Media & Poster Studio – Umm-e-Aiman',
    description:
      'Create and edit campus visuals or animate uploaded photographs into 16:9 and 9:16 promotional videos for Umm-e-Aiman.',
    priority: '0.6',
    changefreq: 'monthly',
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('403') || raw.includes('PERMISSION_DENIED') || raw.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message:
        'This AI studio feature requires an active or billing-enabled API key. Please check or attach a billing-enabled API key in the Settings > Secrets panel.',
    };
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message:
        'API quota reached or paid-tier model requested on a free-tier key. Upgrading to a billing-enabled key in Settings > Secrets increases quota for image and video studio models.',
    };
  }
  return {
    status: 500,
    message: raw || 'Unable to complete the request at this time.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  const resolveBaseUrl = (req: express.Request): string => {
    if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
      return process.env.APP_URL.replace(/\/$/, '');
    }
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    const host = req.headers.host || `localhost:${PORT}`;
    return `${proto}://${host}`;
  };

  // --- SEO: Dynamic robots.txt ---
  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  });

  // --- SEO: Dynamic XML Sitemap ---
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const entries = Object.entries(SERVER_SEO_ROUTES)
      .map(
        ([route, info]) => `  <url>
    <loc>${escapeHtml(baseUrl + route)}</loc>
    <changefreq>${info.changefreq}</changefreq>
    <priority>${info.priority}</priority>
  </url>`
      )
      .join('\n');

    res
      .type('application/xml')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`);
  });

  // --- 1. Google Maps Grounding API (gemini-3.8-flash + googleMaps) ---
  app.post('/api/ai/maps-grounding', async (req, res) => {
    try {
      const { query, latitude, longitude } = req.body || {};
      if (!query || typeof query !== 'string' || query.trim().length < 3) {
        res.status(400).json({ error: 'Please enter a valid location or nearby place question.' });
        return;
      }

      const ai = getGenAI();
      const hasCoords = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Provide accurate, concise geographic and nearby landmark/amenity guidance in English for students and parents visiting: ${query.trim()}`,
        config: {
          tools: [{ googleMaps: {} }],
          ...(hasCoords
            ? {
                toolConfig: {
                  retrievalConfig: {
                    latLng: {
                      latitude: Number(latitude),
                      longitude: Number(longitude),
                    },
                  },
                },
              }
            : {}),
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const places: { title: string; uri: string; reviewSnippets: string[] }[] = [];

      for (const chunk of chunks as Array<Record<string, unknown>>) {
        const mapsObj = chunk.maps as
          | {
              uri?: string;
              title?: string;
              placeAnswerSources?: { reviewSnippets?: Array<{ content?: string } | string> };
            }
          | undefined;
        if (mapsObj?.uri) {
          const snippets = (mapsObj.placeAnswerSources?.reviewSnippets || [])
            .map((s) => (typeof s === 'string' ? s : s?.content || ''))
            .filter(Boolean);
          places.push({
            title: mapsObj.title || 'View on Google Maps',
            uri: mapsObj.uri,
            reviewSnippets: snippets,
          });
        }
      }

      res.json({
        text: response.text || 'Location insights retrieved.',
        places,
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // --- 2. Google Search Grounding API (gemini-3.8-flash + googleSearch) ---
  app.post('/api/ai/search-grounding', async (req, res) => {
    try {
      const { query } = req.body || {};
      if (!query || typeof query !== 'string' || query.trim().length < 3) {
        res.status(400).json({ error: 'Please enter a healthcare course or regulatory question.' });
        return;
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: query.trim(),
        config: {
          systemInstruction:
            'You provide clear, factual, up-to-date public educational information in professional English about allied health sciences, paramedical diplomas (PMF, Pharmacy Council, Pakistan Nursing Council), and student guidance in Punjab, Pakistan. Never fabricate specific private institute claims or guarantee employment.',
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: { title: string; uri: string }[] = [];
      for (const chunk of chunks as Array<Record<string, unknown>>) {
        const webObj = chunk.web as { uri?: string; title?: string } | undefined;
        if (webObj?.uri) {
          sources.push({
            title: webObj.title || webObj.uri,
            uri: webObj.uri,
          });
        }
      }

      res.json({
        text: response.text || 'Information retrieved.',
        sources,
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // --- 3. Image Creation & Editing Studio (gemini-nano-banana-2.1) ---
  app.post('/api/ai/image-studio', async (req, res) => {
    try {
      const { prompt, imageBase64, mimeType, aspectRatio } = req.body || {};
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
        res.status(400).json({ error: 'Please describe the visual you want to create or edit.' });
        return;
      }

      const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
      const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';

      const parts: Array<Record<string, unknown>> = [];
      if (imageBase64 && typeof imageBase64 === 'string') {
        const stripped = imageBase64.replace(/^data:[^;]+;base64,/, '');
        parts.push({
          inlineData: {
            data: stripped,
            mimeType: typeof mimeType === 'string' && mimeType ? mimeType : 'image/jpeg',
          },
        });
      }
      parts.push({ text: prompt.trim() });

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: chosenRatio,
            imageSize: '1K',
          },
        },
      });

      let generatedImageUrl: string | null = null;
      let assistantNote = '';

      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of candidateParts) {
        if (part.inlineData?.data) {
          const outMime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${outMime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          assistantNote += part.text;
        }
      }

      if (!generatedImageUrl) {
        res.status(502).json({ error: 'The model did not return an image. Please refine your prompt and try again.' });
        return;
      }

      res.json({
        imageUrl: generatedImageUrl,
        note: assistantNote.trim(),
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // --- 4. Photo-to-Video Animation Studio (gemini-omni-1.1-flash via Interactions API) ---
  app.post('/api/ai/animate-video', async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt, aspectRatio } = req.body || {};
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Please upload a photo first to animate into video.' });
        return;
      }

      const validAspect: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
      const stripped = imageBase64.replace(/^data:[^;]+;base64,/, '');

      const ai = getGenAI();
      const interaction = await ai.interactions.create(
        {
          model: 'gemini-omni-1.1-flash',
          input: [
            {
              type: 'image',
              mime_type: typeof mimeType === 'string' && mimeType ? mimeType : 'image/jpeg',
              data: stripped,
            },
            {
              type: 'text',
              text:
                typeof prompt === 'string' && prompt.trim().length > 0
                  ? prompt.trim()
                  : 'Gentle, steady camera motion bringing this educational scene naturally to life with realistic lighting.',
            },
          ],
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: validAspect,
            duration: '5s',
            resolution: '720p',
          },
        },
        { timeout: 300000 }
      );

      const videoPart = interaction.output_video as { data?: string; uri?: string; mime_type?: string } | null | undefined;
      if (videoPart?.data) {
        const outMime = videoPart.mime_type || 'video/mp4';
        res.json({
          videoUrl: `data:${outMime};base64,${videoPart.data}`,
          aspectRatio: validAspect,
        });
        return;
      }
      if (videoPart?.uri) {
        res.json({
          videoUrl: videoPart.uri,
          aspectRatio: validAspect,
        });
        return;
      }

      res.status(502).json({ error: 'Video generation completed without a playable video payload.' });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Inject route-specific SEO tags into HTML for crawlers and initial loads
  const injectSeoHtml = (rawHtml: string, req: express.Request): string => {
    const rawPath = (req.originalUrl || req.url || '/').split('?')[0];
    const cleanPath = rawPath === '/' ? '/' : rawPath.replace(/\/$/, '');
    const meta = SERVER_SEO_ROUTES[cleanPath] || SERVER_SEO_ROUTES['/'];
    const canonical = `${resolveBaseUrl(req)}${cleanPath}`;

    return rawHtml
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
      .replace(
        /<meta name="description" content="[^"]*" \/>/,
        `<meta name="description" content="${escapeHtml(meta.description)}" />\n    <link rel="canonical" href="${escapeHtml(canonical)}" />`
      )
      .replace(
        /<meta property="og:title" content="[^"]*" \/>/,
        `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
      )
      .replace(
        /<meta property="og:description" content="[^"]*" \/>/,
        `<meta property="og:description" content="${escapeHtml(meta.description)}" />\n    <meta property="og:url" content="${escapeHtml(canonical)}" />`
      );
  };

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const finalHtml = injectSeoHtml(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      const rawHtml = fs.readFileSync(indexPath, 'utf-8');
      res.status(200).set({ 'Content-Type': 'text/html' }).send(injectSeoHtml(rawHtml, req));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Umm-e-Aiman server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
