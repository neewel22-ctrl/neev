require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const DATA_DIR = path.join(__dirname, 'data');
const CONTACTS_PATH = path.join(DATA_DIR, 'contacts.json');

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// Seed data — preloaded into data/contacts.json on first run
// ---------------------------------------------------------------------------
const SEED_CONTACTS = [
  {"name":"Olivier Guyot","type":"press","email":"","ig":"","tt":"","org":"Fashion Network","notes":"Rédacteur en Chef France"},
  {"name":"Godfrey Deeny","type":"press","email":"","ig":"","tt":"","org":"Fashion Network","notes":"Global Editor-in-Chief"},
  {"name":"Armelle Leturcq","type":"press","email":"","ig":"","tt":"","org":"Crash Magazine","notes":"Editor in Chief & Creative Director"},
  {"name":"Yann Weber","type":"press","email":"","ig":"","tt":"","org":"Antidote Magazine","notes":""},
  {"name":"Henri DeLeBarre","type":"press","email":"","ig":"","tt":"","org":"Antidote Magazine","notes":"Rédacteur en chef"},
  {"name":"Giampetro Baudo","type":"press","email":"","ig":"","tt":"","org":"L'Officiel Europe","notes":"Global Editorial Committee"},
  {"name":"Paul-Emmanuel Reiffers","type":"press","email":"","ig":"","tt":"","org":"Mazarine / Numéro Magazine","notes":"Founder"},
  {"name":"Dana Zkt","type":"influencer","email":"dana.zkt@gmail.com","ig":"dana_zkt","tt":"","org":"","notes":""},
  {"name":"Mariaslls","type":"influencer","email":"maria.sllsfr@gmail.com","ig":"maria.slls","tt":"","org":"","notes":""},
  {"name":"Yagmur Arabaci","type":"influencer","email":"yagmurarabaci99@gmail.com","ig":"","tt":"yagmur.arabaci","org":"","notes":"10.6K TikTok"},
  {"name":"Jihoon Kim","type":"influencer","email":"","ig":"","tt":"","org":"","notes":""},
  {"name":"Sophie (Styled by Sophie)","type":"influencer","email":"","ig":"styledbysophie","tt":"","org":"","notes":""},
  {"name":"Refash","type":"retailer","email":"marketing@refash.in","ig":"refash_","tt":"","org":"Refash","notes":"World's largest upcycled fashion platform"},
  {"name":"Yevgeniya Topyer-Krist","type":"influencer","email":"ytopyer@gmail.com","ig":"yevtopyer","tt":"","org":"","notes":""},
  {"name":"Mary Gonsalves Kinney","type":"influencer","email":"","ig":"mgkstyle","tt":"","org":"","notes":""},
  {"name":"Tess Bruns","type":"influencer","email":"tess.bruns@gmail.com","ig":"phoebephilofan","tt":"","org":"","notes":""},
  {"name":"Maryline","type":"influencer","email":"","ig":"maryline704","tt":"","org":"","notes":""},
  {"name":"Stella Rose","type":"influencer","email":"stellarosegold@gmail.com","ig":"stellarosegold","tt":"","org":"","notes":""},
  {"name":"Cécile Guivarch","type":"influencer","email":"cecilecoachmode@gmail.com","ig":"cecile_gvch","tt":"","org":"","notes":"Coach mode"},
  {"name":"Kristiana Gankevych","type":"influencer","email":"contact.kristiana.nyc@gmail.com","ig":"","tt":"","org":"","notes":"NYC"},
  {"name":"Casey Greco","type":"influencer","email":"fashionwithcaseyg@gmail.com","ig":"fashionwithcaseyg","tt":"","org":"","notes":"Fashion with Casey G"},
  {"name":"Elysia Berman","type":"influencer","email":"mgmt@elysia-berman.com","ig":"elysiaberman","tt":"","org":"","notes":"Management email"},
  {"name":"Laura Bonner","type":"influencer","email":"laura@abouttheoutfits.com","ig":"abouttheoutfits","tt":"","org":"About The Outfits","notes":""},
  {"name":"Camille Depres","type":"influencer","email":"","ig":"alixystories","tt":"","org":"","notes":""},
  {"name":"Laetitia Duclos","type":"influencer","email":"pro.laetitiaduclos@gmail.com","ig":"laetitiaduclos","tt":"","org":"","notes":""},
  {"name":"Cassidy Lynn","type":"influencer","email":"cassidymcneillstyle@gmail.com","ig":"cassadulla","tt":"","org":"","notes":""},
  {"name":"Salma","type":"influencer","email":"igbysalma@gmail.com","ig":"igbysalma","tt":"","org":"","notes":""},
  {"name":"Zeyno Taylan","type":"influencer","email":"laskham@beunscripted.co.uk","ig":"zeynotaylan","tt":"","org":"Beunscripted","notes":"Agency email"},
  {"name":"Sinead McKeefry","type":"influencer","email":"info@sineadmckeefrystylecounsel.com","ig":"sineadmckeefry","tt":"","org":"Style Counsel","notes":""},
  {"name":"Deni Kiro","type":"influencer","email":"styliststylist@denikiro.com","ig":"deni.kiro","tt":"","org":"","notes":"Stylist"},
  {"name":"Andrea Kok","type":"influencer","email":"contact.andreakok@gmail.com","ig":"andreakok_","tt":"","org":"","notes":""},
  {"name":"Cléa (Je Parle Mode)","type":"influencer","email":"contact.jeparlemode@gmail.com","ig":"jeparlemode","tt":"","org":"Je Parle Mode","notes":""},
  {"name":"Elissia Santisi","type":"influencer","email":"","ig":"elissiasantisi","tt":"","org":"","notes":""},
  {"name":"Solan Monpelat-Pitsch","type":"influencer","email":"solanpitsch@gmail.com","ig":"solanpitsch","tt":"","org":"","notes":""},
  {"name":"Dina Alami","type":"influencer","email":"dinalami22@gmail.com","ig":"dinaintheworld","tt":"","org":"","notes":""},
  {"name":"Manon Terles","type":"influencer","email":"manaaterles@gmail.com","ig":"manon.terles","tt":"","org":"","notes":""},
  {"name":"Tany Moko","type":"influencer","email":"tanymoko.pr@gmail.com","ig":"tany_moko","tt":"","org":"","notes":""},
  {"name":"Tinsley Crisp","type":"influencer","email":"tinsleycrisp@gmail.com","ig":"trendingwithtinsley","tt":"","org":"","notes":"Trending with Tinsley"},
  {"name":"Yagmur Tok","type":"influencer","email":"mgmt@yagmurtok.com","ig":"selloutartist_","tt":"","org":"","notes":"Management email"},
  {"name":"Jess Work","type":"influencer","email":"thejlwork@gmail.com","ig":"jessworkk","tt":"","org":"","notes":""},
  {"name":"Lava (Life of Lava)","type":"influencer","email":"","ig":"lifeoflava","tt":"","org":"","notes":""},
  {"name":"Cassie Thorpe","type":"influencer","email":"cassie@whalartalent.com","ig":"itscassythorpe","tt":"","org":"Whalar Talent","notes":"Agency email"},
  {"name":"Elysze Held","type":"influencer","email":"","ig":"","tt":"","org":"","notes":""},
  {"name":"Ume Roman","type":"influencer","email":"","ig":"umeromaan","tt":"","org":"","notes":""},
  {"name":"Emmy Gunn","type":"influencer","email":"emmygunn@graafledin.com","ig":"emmygunn","tt":"","org":"Graafledin","notes":""},
  {"name":"Ine De Troeyer","type":"influencer","email":"i.detroeyer@gmail.com","ig":"inedetroeyer","tt":"","org":"","notes":""},
  {"name":"Yvette (Yvette is Styling)","type":"influencer","email":"yvetteisstyling@gmail.com","ig":"yvetteisstyling","tt":"","org":"","notes":"NYC Stylist"},
  {"name":"Danielle Cafiero","type":"influencer","email":"styling@daniellecafiero.com","ig":"daniellecafierro_","tt":"","org":"","notes":"Stylist"},
  {"name":"Dali Larad","type":"influencer","email":"daliradoncic13@gmail.com","ig":"dalilarad","tt":"","org":"","notes":""},
  {"name":"Rae Harrison","type":"influencer","email":"Rae@18talent.com","ig":"stretchnnfetc","tt":"","org":"18 Talent","notes":"Agency email"},
  {"name":"Sofia C","type":"influencer","email":"assistant@sofiacstyle.com","ig":"sofiacstyle","tt":"","org":"","notes":"NYC Stylist, assistant email"},
  {"name":"Elina Garashchenko","type":"influencer","email":"g.elina.garaeva@gmail.com","ig":"elina.garaeva","tt":"","org":"","notes":""},
  {"name":"Cosmic Clementine","type":"influencer","email":"collabwithcosmic@gmail.com","ig":"itscosmicclementine","tt":"","org":"","notes":""},
  {"name":"Alexa J King","type":"influencer","email":"","ig":"alexaa_jadee","tt":"","org":"","notes":""},
  {"name":"Ally MacRae","type":"influencer","email":"","ig":"ally.macrae","tt":"","org":"","notes":""},
  {"name":"Amélie Carrara","type":"influencer","email":"","ig":"ameliecarrara","tt":"","org":"","notes":""},
  {"name":"Maaike Lothmann","type":"influencer","email":"Maaike@listheagency.com","ig":"maaikelothmann","tt":"","org":"Listhea Agency","notes":""},
  {"name":"Natallia Bondar","type":"influencer","email":"","ig":"natalliia.bondar","tt":"","org":"","notes":""},
  {"name":"Aimee Song","type":"influencer","email":"","ig":"aimeesong","tt":"","org":"","notes":"Song of Style"},
  {"name":"Alex Dobrica","type":"influencer","email":"alexdobrica@gmail.com","ig":"styleme.alex","tt":"","org":"Style Me Alex","notes":""},
  {"name":"Deni Kiro (style account)","type":"influencer","email":"stylist@denikiro.com","ig":"denikirostyle","tt":"","org":"","notes":"Stylist"},
  {"name":"Natasha Krokhta","type":"influencer","email":"","ig":"natashakrokhta","tt":"","org":"","notes":""},
  {"name":"Sam Preston","type":"influencer","email":"samprestonstylist@gmail.com","ig":"sam.preston__","tt":"","org":"","notes":"Stylist"},
  {"name":"Luca Gallaccio","type":"influencer","email":"lucallaccio@gmail.com","ig":"lucallaccio","tt":"","org":"Shaire Fraiche","notes":""},
  {"name":"Céline Séris","type":"influencer","email":"celine@iznowgood.com","ig":"iznowgood_","tt":"","org":"Iznowgood","notes":""},
  {"name":"Nawal Bonnefoy","type":"influencer","email":"bonnefoynawal@gmail.com","ig":"nawalbonnefoy","tt":"","org":"","notes":""},
  {"name":"Hannah Wang","type":"influencer","email":"hannahw@thetalentnet.com.au","ig":"whhannahw","tt":"","org":"The Talent Net AU","notes":""},
  {"name":"Marie Christiane Marek","type":"influencer","email":"","ig":"","tt":"","org":"","notes":""}
];

// ---------------------------------------------------------------------------
// 37 enrichment search batches
// ---------------------------------------------------------------------------
const SEARCH_BATCHES = [
  { label: 'FR influencers — slow fashion', query: 'French Instagram fashion influencer slow fashion natural fabrics contact email' },
  { label: 'FR influencers — minimaliste Paris', query: 'influenceuse mode minimaliste Paris Instagram 2024 contact' },
  { label: 'FR influencers — haut de gamme', query: 'French fashion influencer haut de gamme wardrobe essentials Paris Instagram email' },
  { label: 'FR influencers — made in France', query: 'influenceuse mode made in France qualité Instagram email' },
  { label: 'FR créateurs contenu mode', query: 'créateur contenu mode Paris Instagram 2024 collaboration marque email' },
  { label: 'EU influencers — quiet luxury', query: 'European fashion influencer quiet luxury minimal aesthetic Instagram email collaboration' },
  { label: 'EU influencers — Scandinavia', query: 'Scandinavian fashion influencer minimalist wardrobe Instagram collab email' },
  { label: 'EU influencers — Italy', query: 'Italian fashion influencer timeless style Instagram email collaboration brand' },
  { label: 'EU influencers — Germany', query: 'German fashion blogger minimalist style natural fabrics Instagram email' },
  { label: 'EU influencers — Belgium/NL', query: 'Belgian Dutch fashion influencer slow fashion Instagram email contact 2024' },
  { label: 'US influencers — quiet luxury NYC', query: 'NYC fashion influencer quiet luxury natural fabrics Instagram email contact' },
  { label: 'US influencers — Parisian aesthetic', query: 'US fashion influencer Parisian style minimal wardrobe Instagram email brand collab' },
  { label: 'US influencers — slow fashion', query: 'American slow fashion influencer Instagram email collaboration sustainable natural' },
  { label: 'US influencers — investment dressing', query: 'fashion influencer investment pieces capsule wardrobe Instagram email contact 2024' },
  { label: 'Global — BIPOC fashion creators', query: 'fashion creator natural aesthetic minimal Instagram global email collaboration brand 2024' },
  { label: 'Global — fashion Substack writers', query: 'fashion writer Substack newsletter slow fashion natural fabrics contact email 2024' },
  { label: 'FR press — mode rédacteurs', query: 'rédacteur mode Paris magazine email contact 2024 Madame Figaro Elle Vogue France' },
  { label: 'FR press — indépendants', query: 'journaliste mode indépendant Paris email presse contact 2024' },
  { label: 'FR press — Vogue FR', query: 'Vogue France editor fashion journalist email contact Paris 2024' },
  { label: 'FR press — Elle Marie Claire', query: 'Elle France Marie Claire rédacteur mode email contact journaliste 2024' },
  { label: 'EU press — Wallpaper i-D', query: 'Wallpaper iD magazine fashion editor email contact Europe 2024' },
  { label: 'EU press — Dazed Vogue UK', query: 'Dazed Beauty Vogue UK fashion journalist editor email contact 2024' },
  { label: 'EU press — indie magazines', query: 'independent fashion magazine Europe editor email contact slow fashion 2024' },
  { label: 'US press — Vogue WSJ', query: 'Vogue WSJ New York Times fashion editor email contact journalist 2024' },
  { label: 'US press — indie fashion media', query: 'independent fashion media journalist editor email contact USA 2024 slow fashion' },
  { label: 'FR stylists — Paris', query: 'styliste mode Paris Instagram email contact collaboration 2024' },
  { label: 'FR stylists — editorial', query: 'styliste editorial Paris Instagram email presse mode 2024' },
  { label: 'EU stylists — London Milan', query: 'fashion stylist London Milan Instagram email contact editorial 2024' },
  { label: 'US stylists — NYC LA', query: 'fashion stylist NYC Los Angeles Instagram email editorial contact 2024' },
  { label: 'US stylists — celebrity', query: 'celebrity fashion stylist Instagram email contact collaboration brand 2024' },
  { label: 'Retailers — Paris concept stores', query: 'Paris concept store slow fashion natural fabrics buyer contact email 2024' },
  { label: 'Retailers — EU boutiques', query: 'European boutique slow fashion natural fabrics buyer email contact stockist 2024' },
  { label: 'Retailers — US boutiques', query: 'US boutique slow fashion natural fabrics buyer email stockist contact 2024' },
  { label: 'Niche — fashion Substack/podcast', query: 'fashion podcast host Substack writer natural fabrics minimal style email contact 2024' },
  { label: 'Niche — resale/vintage curators', query: 'vintage fashion curator Instagram email contact collab 2024 slow fashion' },
  { label: 'Niche — interior/lifestyle crossover', query: 'lifestyle interior design Instagram influencer fashion crossover email contact 2024' },
  { label: 'Niche — art/culture Paris', query: 'artiste galerie Paris Instagram mode collaboration email contact 2024' }
];

// ---------------------------------------------------------------------------
// Brand context & voice rules used in outreach email generation
// ---------------------------------------------------------------------------
const BRAND_CONTEXT = `NEEV (neev.paris) is a made-to-order Parisian womenswear brand, haut de gamme.
Zero overproduction — every piece made after ordering, no stock, no discounts, no seasonal collections.
Exclusively natural fabrics: silk, wool, cashmere, Tencel.
Production in Parisian ateliers (Île-de-France).
Tagline: "Devoted to Permanence".
Pilot Collection: The Shell (100% silk top, €220), The Column (Italian wool wide-leg trousers, €310), The Ines Jacket (wool/cashmere blend, €390), The Wrap (Tencel blouse, €210). French sizing 34–42.
Nawel's story: arrived in Paris alone at 14, scouted but not signed by modeling agencies at 17, redirected that into building NEEV entirely alone — branding, sourcing, website, direction artistique, over 18 months.`;

const VOICE_RULES = `Understated, factual, no hype.
No buzzwords: never "luxury", "sustainable", "conscious", "ethical", "passionate".
Specifics do the work: materials, process, location, quantities.
First person, short sentences.
Signed: Nawel.`;

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------
function ensureContactsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONTACTS_PATH)) {
    fs.writeFileSync(CONTACTS_PATH, JSON.stringify(SEED_CONTACTS, null, 2));
  }
}

function readContacts() {
  ensureContactsFile();
  return JSON.parse(fs.readFileSync(CONTACTS_PATH, 'utf-8'));
}

function writeContacts(contacts) {
  fs.writeFileSync(CONTACTS_PATH, JSON.stringify(contacts, null, 2));
}

// ---------------------------------------------------------------------------
// Anthropic API helper
// ---------------------------------------------------------------------------
async function callAnthropic(prompt, { useWebSearch = true } = {}) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to your .env file.');
  }

  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  };
  if (useWebSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  // Concatenate all text blocks (web search responses interleave tool use / tool result / text blocks)
  const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text);
  return textBlocks.join('\n');
}

function extractJsonArray(text) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

function extractJsonObject(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Routes — Enrich
// ---------------------------------------------------------------------------
app.get('/api/batches', (req, res) => {
  res.json(SEARCH_BATCHES.map((b, i) => ({ index: i, label: b.label, query: b.query })));
});

app.get('/api/contacts', (req, res) => {
  res.json(readContacts());
});

app.post('/api/enrich/batch', async (req, res) => {
  const { index } = req.body;
  const batch = SEARCH_BATCHES[index];
  if (!batch) return res.status(400).json({ error: 'Invalid batch index' });

  try {
    const contacts = readContacts();

    const prompt = `You are researching real people for NEEV Paris, a made-to-order Parisian womenswear brand (minimal, natural fabrics, slow fashion aesthetic).

Search query focus: "${batch.query}"

Use web search to find 6–10 REAL, SPECIFIC people matching this query. Rules:
- Only include people with a real, verifiable Instagram or TikTok presence.
- Only include an email address if it is explicitly public (in their bio, website, or Linktree). Never guess or fabricate an email.
- Exclude celebrities with over 2 million followers, unless they are press/editors.
- Focus on people whose aesthetic aligns with minimal, natural, Parisian, or slow fashion.

Return ONLY a valid JSON array, with no other text, in this exact format:
[{"name":"...","type":"influencer|press|stylist|retailer","ig":"handle_without_@","tt":"tiktok_or_empty","email":"email_or_empty","location":"city, country","why":"1 sentence why relevant for NEEV"}]`;

    const responseText = await callAnthropic(prompt, { useWebSearch: true });
    const found = extractJsonArray(responseText) || [];

    const existingNames = new Set(contacts.map(c => (c.name || '').toLowerCase().trim()));
    const existingHandles = new Set(contacts.map(c => (c.ig || '').toLowerCase().trim()).filter(Boolean));

    const added = [];
    for (const person of found) {
      const name = (person.name || '').toLowerCase().trim();
      const handle = (person.ig || '').toLowerCase().trim();
      if (!name) continue;
      if (existingNames.has(name)) continue;
      if (handle && existingHandles.has(handle)) continue;

      existingNames.add(name);
      if (handle) existingHandles.add(handle);

      const contact = {
        name: person.name,
        type: person.type || 'influencer',
        email: person.email || '',
        ig: person.ig || '',
        tt: person.tt || '',
        org: '',
        notes: person.why || '',
        location: person.location || '',
        source: batch.label
      };
      contacts.push(contact);
      added.push(contact);
    }

    writeContacts(contacts);

    res.json({
      batchIndex: index,
      label: batch.label,
      foundCount: found.length,
      addedCount: added.length,
      added,
      totalContacts: contacts.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Routes — Email drafts
// ---------------------------------------------------------------------------
app.post('/api/draft/generate', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing contact name' });

  try {
    const contacts = readContacts();
    const idx = contacts.findIndex(c => c.name === name);
    if (idx === -1) return res.status(404).json({ error: 'Contact not found' });
    const contact = contacts[idx];

    let goal;
    if (contact.type === 'influencer' || contact.type === 'stylist') {
      goal = 'Propose gifting a NEEV piece in exchange for content, or a paid collaboration if their scale suggests it.';
    } else if (contact.type === 'press') {
      goal = "Pitch a story angle: the made-to-order model, Parisian atelier production, or Nawel's personal story.";
    } else {
      goal = 'Open a conversation about carrying the collection in their store, mentioning the made-to-order production model.';
    }

    const profileBits = [
      contact.org && `Organization: ${contact.org}`,
      contact.ig && `Instagram: @${contact.ig}`,
      contact.tt && `TikTok: @${contact.tt}`,
      contact.location && `Location: ${contact.location}`,
      contact.notes && `Notes: ${contact.notes}`
    ].filter(Boolean).join('\n');

    const prompt = `You are writing a personalized cold outreach email from Nawel, founder of NEEV Paris, to the following person:

Name: ${contact.name}
Type: ${contact.type}
${profileBits}

First, use web search to research this person briefly (their work, aesthetic, audience).

BRAND CONTEXT (always reflect accurately, do not invent details beyond this):
${BRAND_CONTEXT}

VOICE RULES (follow strictly):
${VOICE_RULES}

GOAL FOR THIS EMAIL: ${goal}

Detect the person's likely language from their profile (French or English). Default to French if uncertain.

Return ONLY valid JSON, with no other text, in this exact format:
{"research_summary":"2–3 sentences about who they are","subject":"email subject","body":"full email body under 120 words","lang":"fr|en"}`;

    const responseText = await callAnthropic(prompt, { useWebSearch: true });
    const draft = extractJsonObject(responseText);
    if (!draft) {
      return res.status(502).json({ error: 'Could not parse draft JSON from model response' });
    }

    contacts[idx] = {
      ...contact,
      draft: {
        subject: draft.subject || '',
        body: draft.body || '',
        lang: draft.lang || 'fr',
        research_summary: draft.research_summary || ''
      }
    };
    writeContacts(contacts);

    res.json({ name: contact.name, draft: contacts[idx].draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Export — CSV helpers
// ---------------------------------------------------------------------------
function csvEscape(value) {
  const s = (value === undefined || value === null) ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows) {
  return rows.map(row => row.map(csvEscape).join(',')).join('\r\n');
}

function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0] || '', last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

app.get('/api/export/klaviyo', (req, res) => {
  const contacts = readContacts().filter(c => c.email);
  const rows = [['Email', 'First Name', 'Last Name', 'Type', 'Organization', 'Instagram', 'TikTok', 'Language', 'Research Summary', 'Notes']];
  for (const c of contacts) {
    const { first, last } = splitName(c.name);
    rows.push([
      c.email, first, last, c.type || '', c.org || '', c.ig || '', c.tt || '',
      (c.draft && c.draft.lang) || '', (c.draft && c.draft.research_summary) || '', c.notes || ''
    ]);
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="neev_klaviyo.csv"');
  res.send(toCsv(rows));
});

app.get('/api/export/drafts', (req, res) => {
  const contacts = readContacts().filter(c => c.draft && c.draft.body);
  const rows = [['Name', 'Email', 'Type', 'Instagram', 'Subject', 'Body', 'Language', 'Research Summary']];
  for (const c of contacts) {
    rows.push([c.name, c.email || '', c.type || '', c.ig || '', c.draft.subject || '', c.draft.body || '', c.draft.lang || '', c.draft.research_summary || '']);
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="neev_drafts.csv"');
  res.send(toCsv(rows));
});

app.get('/api/export/full', (req, res) => {
  const contacts = readContacts();
  const rows = [['Name', 'Type', 'Instagram', 'TikTok', 'Email', 'Location', 'Notes', 'Source']];
  for (const c of contacts) {
    rows.push([c.name, c.type || '', c.ig || '', c.tt || '', c.email || '', c.location || '', c.notes || '', c.source || '']);
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="neev_full_list.csv"');
  res.send(toCsv(rows));
});

ensureContactsFile();

app.listen(PORT, () => {
  console.log(`NEEV outreach tool running at http://localhost:${PORT}`);
});
