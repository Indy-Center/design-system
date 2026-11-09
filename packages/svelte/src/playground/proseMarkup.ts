// The HTML RichText writes for Lexical's nodes beyond the lesson's:
// underline and strike, a checklist, alignment, tables with header cells and
// a merged cell, and links that open in a new tab. Written by hand in the
// shape the rich text decision sets; the Prose playground page shows it and
// Prose's tests check it. Made-up text.
export const richHtml = `
<h2>Rich text</h2>
<p>Text can be <u>underlined</u> or <s>struck through</s>, and links can go <a href="/lessons/taxi">inside the site</a>, <a href="https://example.com/orders/7110" target="_blank" rel="noopener noreferrer">to a new tab</a>, or <a href="https://example.com/handbook">to another site</a>.</p>
<p data-align="center">A centred paragraph, such as a title line.</p>
<p data-align="end">A paragraph aligned to the end, such as a signature.</p>
<p data-align="justify">A justified paragraph runs its lines to both edges, and breaks long words with hyphens where the browser can, so a narrow column on a phone does not open wide gaps between words.</p>
<h3>Before you start</h3>
<ul>
  <li><label><input type="checkbox"> Read the field diagram of Example Field</label></li>
  <li><label><input type="checkbox"> Load the sector file, then check that the runways, taxiways and hold-short lines all draw where the diagram has them</label></li>
  <li><label><input type="checkbox"> Join the voice channel</label></li>
</ul>
<h3>Positions</h3>
<table>
  <thead>
    <tr><th scope="col">Position</th><th scope="col">Frequency</th><th scope="col">Notes</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Ground</th><td>121.900</td><td>Taxi clearances</td></tr>
    <tr><th scope="row">Tower</th><td>118.300</td><td>Runway crossings</td></tr>
    <tr><th scope="row">Clearance</th><td colspan="2">Combined with Ground when quiet</td></tr>
  </tbody>
</table>
<h3>A wide table</h3>
<table>
  <thead>
    <tr><th scope="col">Runway</th><th scope="col">Length</th><th scope="col">Width</th><th scope="col">Surface</th><th scope="col">Lighting</th><th scope="col">Approach</th><th scope="col">Closed hours</th><th scope="col">Remarks</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">9/27</th><td>10,000 ft</td><td>150 ft</td><td>Asphalt</td><td>High intensity</td><td>Precision</td><td>None at all</td><td>Made-up field, made-up remarks</td></tr>
    <tr><th scope="row">18/36</th><td>7,000 ft</td><td>100 ft</td><td>Concrete</td><td>Medium intensity</td><td>Visual</td><td>0200 to 0500</td><td>Crosses 9/27 at the middle</td></tr>
  </tbody>
</table>
`;
