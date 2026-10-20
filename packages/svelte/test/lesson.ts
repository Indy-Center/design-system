// A lesson plan's bodyHtml as Payload writes it and indy-library shows it
// with {@html}: indy-library's S-GC-1 fixture ("Taxi basics"), whose body
// is one line, grown to every element a CMS lesson plan can hold. The
// playground shows it too.
export const lessonHtml = `
<p>Read the field diagram of Example Field before the lesson.</p>
<p>This lesson covers moving aircraft between the ramp and the runway at a made-up field. By the end, the student issues <strong>taxi clearances</strong> with the correct route and hold-short instructions, and knows when to give <em>progressive taxi</em>. See the <a href="https://www.faa.gov/air_traffic/publications/atpubs/atc_html/">FAA 7110.65</a>, chapter 3, section 7.</p>
<h2>Before the session</h2>
<ul>
  <li>Open the field diagram and find runways 9/27 and 18/36.</li>
  <li>Load the <code>KXMP</code> sector file in CRC.</li>
  <li>Review the task list for this lesson:
    <ul>
      <li>1.1 Issue a taxi clearance</li>
      <li>1.2 Give progressive taxi</li>
    </ul>
  </li>
</ul>
<h2>Taxi clearances</h2>
<p>A taxi clearance gives the route and the runway. Name every taxiway in order, and every runway the aircraft must hold short of.</p>
<ol>
  <li>Call sign.</li>
  <li>Runway, then <q>taxi via</q> and the route.</li>
  <li>Any hold-short instruction, which the pilot must read back.</li>
</ol>
<blockquote><p>An aircraft must not cross or enter a runway without an explicit clearance, even one with no traffic.</p></blockquote>
<h3>Phraseology</h3>
<pre><code>N123AB, runway 27, taxi via A, B, hold short of runway 18.
N123AB, cross runway 18 at B.</code></pre>
<h4>Readbacks</h4>
<p>The pilot reads back every hold-short instruction. Correct a wrong readback at once.</p>
<h3>Common mistakes</h3>
<table>
  <thead>
    <tr><th>Mistake</th><th>Why it matters</th><th>Fix</th></tr>
  </thead>
  <tbody>
    <tr><td>Leaving out a hold short</td><td>The pilot may cross a runway</td><td>Name every runway on the route</td></tr>
    <tr><td>Route out of order</td><td>The pilot taxis the wrong way</td><td>Read the diagram ramp to runway</td></tr>
    <tr><td>No readback check</td><td>A wrong readback goes unnoticed</td><td>Listen for the hold short</td></tr>
  </tbody>
</table>
<hr>
<h2>Progressive taxi</h2>
<p>Give turn-by-turn directions when a pilot asks, or is unfamiliar with the field. Press <kbd>F1</kbd> to open the field diagram in CRC.</p>
`;
