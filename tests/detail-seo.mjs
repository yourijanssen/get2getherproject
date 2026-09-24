import assert from 'node:assert/strict';

const origin = process.env.SEO_TEST_ORIGIN || 'http://localhost:3002';
// Read raw HTML as a crawler, without JavaScript or any database mutation.
async function html(path) {
  const response = await fetch(new URL(path, origin), { headers: { 'user-agent': 'Googlebot' } });
  return { status: response.status, body: await response.text() };
}
// Extract metadata while tolerating HTML's ampersand escaping in canonical URLs.
function tag(body, pattern) {
  return body.match(pattern)?.[1]?.replaceAll('&amp;', '&');
}
let checked = 0;
for (const language of ['el', 'en']) {
  for (const path of ['/', '/events', '/extras', '/about', '/contact', '/diy-kits', '/privacy-policy', '/reviews']) {
    const page = await html(`${path}?lang=${language}`);
    assert.equal(page.status, 200, path);
    assert.match(page.body, new RegExp(`<html[^>]*lang="${language}"`), path);
  }
  for (const workspace of ['events', 'extras']) {
    const listing = await html(`/${workspace}?lang=${language}`);
    assert.doesNotMatch(listing.body, /href="[^"\s]*#(?:event|extra)\//);
    const urls = [...new Set([...listing.body.matchAll(new RegExp(`href="(/${workspace}/[^"#]+)"`, 'g'))].map(match => match[1]))];
    assert.ok(urls.length, `Need at least one published ${workspace} fixture`);
    for (const url of urls) {
      const detail = await html(url);
      assert.equal(detail.status, 200, url);
      assert.match(detail.body, new RegExp(`<html[^>]*lang="${language}"`), url);
      const heading = tag(detail.body, /<h1[^>]*>(.*?)<\/h1>/s);
      const title = tag(detail.body, /<title>(.*?)<\/title>/s);
      assert.ok(heading && title?.includes(heading), url);
      assert.ok(tag(detail.body, /<meta name="description" content="([^"]+)"/), url);
      assert.equal(new URL(tag(detail.body, /<link rel="canonical" href="([^"]+)"/)).pathname, new URL(url, origin).pathname);
      assert.equal(new URL(tag(detail.body, /<link rel="canonical" href="([^"]+)"/)).searchParams.get('lang'), language);
      assert.match(detail.body, /hrefLang="el"/);
      assert.match(detail.body, /hrefLang="en"/);
      assert.ok(tag(detail.body, /<meta property="og:title" content="([^"]+)"/));
      checked++;
    }
    const missing = await html(`/${workspace}/seo-test-not-a-published-record?lang=${language}`);
    assert.equal(missing.status, 404);
    assert.match(missing.body, /noindex/);
  }
}
for (const query of ['', '?lang=invalid', '?lang=en&lang=el']) {
  assert.match((await html('/' + query)).body, /<html[^>]*lang="el"/);
}
console.log(`PASS: ${checked} bilingual published detail pages, server HTML language, metadata, canonical/hreflang, real links, missing-record 404/noindex, language defaults.`);
