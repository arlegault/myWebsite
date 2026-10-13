const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const test = require("node:test");
const { HtmlValidate } = require("html-validate");

const root = path.resolve(__dirname, "..");
const site = path.join(root, "_site");

const pages = [
  "index.html",
  "about.html",
  "writing.html",
  "books.html",
  "side_projects.html",
  "consulting.html",
  "error.html",
  "design_systems.html",
  "seattle_tech.html",
  "transitioning_to_product.html",
  "building_context.html",
  "persistence.html",
  "ai_curve.html",
];

const essays = [
  "ai_curve.html",
  "persistence.html",
  "transitioning_to_product.html",
  "building_context.html",
  "seattle_tech.html",
  "design_systems.html",
];

const titles = {
  "index.html": "Alex Legault",
  "about.html": "About | Alex Legault",
  "writing.html": "Writing | Alex Legault",
  "books.html": "Books | Alex Legault",
  "side_projects.html": "Side Projects | Alex Legault",
  "consulting.html": "Consulting | Alex Legault",
  "error.html": "Page Not Found | Alex Legault",
  "design_systems.html": "Design Systems | Alex Legault",
  "seattle_tech.html": "Seattle Tech | Alex Legault",
  "transitioning_to_product.html": "Transitioning to Product | Alex Legault",
  "building_context.html": "Building Context | Alex Legault",
  "persistence.html": "Persistence | Alex Legault",
  "ai_curve.html": "Where We Actually Are on the AI Curve | Alex Legault",
};

function read(name) {
  return fs.readFileSync(path.join(site, name), "utf8");
}

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

test("builds every page with shared metadata", () => {
  for (const name of pages) {
    const html = read(name);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    assert.match(html, /<meta charset="utf-8">/);
    assert.match(html, new RegExp(`<title>${titles[name]}</title>`));
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.match(html, /<meta property="og:title"/);
    assert.match(html, /<meta property="og:description"/);
    assert.match(html, /<meta property="og:url"/);
    assert.match(html, /<meta property="og:image"/);
    assert.match(html, /<meta name="twitter:card" content="summary">/);
    assert.match(html, /<meta name="twitter:title"/);
    assert.match(html, /<meta name="twitter:description"/);
    assert.match(html, /<meta name="twitter:image"/);
    assert.match(html, /<link rel="icon" href="favicon\.svg"/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /<nav aria-label="Primary">/);
    assert.match(html, /G-NXF5ZY7FV4/);
    assert.doesNotMatch(html, /G-(?!NXF5ZY7FV4)\w+/);
    assert.doesNotMatch(html, /return false/);
    assert.doesNotMatch(html, /window\.location/);
    assert.doesNotMatch(html, /<br\b/i);
    assert.doesNotMatch(html, /style="/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);

    const visible = stripComments(html);
    const nav = visible.match(/<nav[\s\S]*?<\/nav>/)[0];
    for (const essay of essays) {
      assert.doesNotMatch(nav, new RegExp(essay));
    }
    assert.doesNotMatch(nav, /consulting\.html/);
    assert.match(nav, /target="_blank" rel="noopener">Professional experience/);
    assert.match(nav, /target="_blank" rel="noopener">Building tech debt in public/);

    for (const tag of visible.matchAll(/<a\b[^>]*>/g)) {
      if (/target="_blank"/.test(tag[0])) {
        assert.match(tag[0], /rel="noopener"/, `${name} missing rel=noopener: ${tag[0]}`);
      }
    }
    for (const img of visible.matchAll(/<img\b[^>]*>/g)) {
      assert.match(img[0], /\balt="[^"]+"/, `${name} image missing alt: ${img[0]}`);
    }
  }
});

test("homepage intro uses the bio pitch and headshot", () => {
  const html = read("index.html");
  assert.match(html, /General Manager at/);
  assert.match(html, /href="https:\/\/lumonic\.com"/);
  assert.match(html, /10\+ years leading product at/);
  assert.match(html, /href="https:\/\/pitchbook\.com"/);
  assert.match(html, /Carta Fund Admin/);
  assert.match(html, /10-15M ARR to 9 figures/);
  assert.match(html, /src="AL_headshot\.jpeg"/);
  assert.match(html, /alt="Headshot of Alex Legault"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/alexlegault\.com\/">/);
});

test("about page keeps the original bio wording", () => {
  const html = stripComments(read("about.html"));
  const phrases = [
    "I like building and learning.",
    "For the past decade+, I've been leading product teams at",
    "PitchBook Data",
    "Carta- Fund Admin",
    'My "sweet spot" has been joining teams in the 10-15M ARR range and scaling them to 9 figures.',
    "Currently, I serve as General Manager at",
    "from 100k in ARR to 9 figures.",
    "early stage stage startups in Seattle",
    "improving my spanish.",
    "hello at alexlegault.com.",
    "How to break into Product Management",
    "You are working on something interesting",
  ];
  for (const phrase of phrases) {
    assert.ok(html.includes(phrase), `missing phrase: ${phrase}`);
  }
  assert.doesNotMatch(html, /<p>\s*<ul/);
  assert.match(html, /<ul>\s*<li>How to break into Product Management<\/li>/);
});

test("essays stay unlinked and out of the sitemap", () => {
  const writing = read("writing.html");
  const visible = stripComments(writing);
  for (const essay of essays) {
    assert.match(writing, new RegExp(`<!--[\\s\\S]*${essay}[\\s\\S]*?-->`));
    assert.doesNotMatch(visible, new RegExp(essay));
  }
  assert.match(writing, /Where We Actually Are on the AI Curve/);
  assert.match(writing, /Why doesn't Seattle have more startups\?/);

  const sitemap = read("sitemap.xml");
  const allowed = [
    "https://alexlegault.com/",
    "https://alexlegault.com/about.html",
    "https://alexlegault.com/writing.html",
    "https://alexlegault.com/books.html",
    "https://alexlegault.com/side_projects.html",
  ];
  for (const url of allowed) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  }
  for (const essay of [...essays, "consulting.html", "error.html"]) {
    assert.doesNotMatch(sitemap, new RegExp(essay));
  }
  for (const essay of [...essays, "consulting.html", "error.html"]) {
    assert.match(read(essay), /<meta name="robots" content="noindex">/);
  }
  for (const page of ["index.html", "about.html", "writing.html", "books.html", "side_projects.html"]) {
    assert.doesNotMatch(read(page), /noindex/);
  }
});

test("only the AI curve post has a date, taken from the essay", () => {
  assert.match(read("ai_curve.html"), /<time datetime="2026-02">February 2026<\/time>/);
  assert.match(read("ai_curve.html"), /February of 2026/);
  for (const name of pages) {
    if (name === "ai_curve.html") continue;
    assert.doesNotMatch(read(name), /<time\b/);
  }
});

test("side projects lists openwrap.ai as contributor", () => {
  const html = read("side_projects.html");
  assert.match(html, /<a href="https:\/\/jdaas\.xyz\/">Jeff Dean Jokes<\/a>/);
  assert.match(html, /<a href="https:\/\/protocolfarm\.xyz\/">Unfinished side project with a cool UI<\/a>/);
  assert.match(html, /<a href="https:\/\/openwrap\.ai">openwrap\.ai<\/a> \(contributor\)/);
  assert.match(html, /Occassionally I like to build something myself/);
});

test("book list keeps the shelf notes and drops the commented-out title", () => {
  const html = stripComments(read("books.html"));
  assert.equal((html.match(/<li>/g) || []).length, 99);
  assert.match(html, /waether\/wind patterns/);
  assert.match(html, /data vizualiations/);
  assert.match(html, /Maples Ziebelman/);
  assert.match(html, /near my moms house/);
  assert.match(html, /href="https:\/\/asn\.flightsafety\.org\/wikibase\/462500"/);
  assert.doesNotMatch(html, /Long Range Shooting Handbook/);
});

test("stylesheet is a responsive system-font layout with dark mode", () => {
  const css = read("mystyle.css");
  assert.match(css, /-apple-system,\s*BlinkMacSystemFont,\s*"Segoe UI"/);
  assert.match(css, /max-width:\s*calc\(65ch \+ 2\.5rem\)/);
  assert.match(css, /prefers-color-scheme:\s*dark/);
  assert.match(css, /--link:/);
  assert.doesNotMatch(css, /width:\s*50%/);
});

test("city_tiers.jpeg is copied unchanged", () => {
  const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  assert.equal(hash(path.join(root, "city_tiers.jpeg")), hash(path.join(site, "city_tiers.jpeg")));
});

test("built pages are valid html", async () => {
  const htmlvalidate = new HtmlValidate({
    extends: ["html-validate:recommended"],
    rules: {
      "no-trailing-whitespace": "off",
      "require-sri": "off",
      "script-type": "off",
      "tel-non-breaking": "off",
    },
  });
  const problems = [];
  for (const name of pages) {
    const report = await htmlvalidate.validateFile(path.join(site, name));
    if (!report.valid) {
      for (const result of report.results) {
        for (const message of result.messages) {
          problems.push(`${name}:${message.line}:${message.column} ${message.ruleId} ${message.message}`);
        }
      }
    }
  }
  assert.deepEqual(problems, []);
});
