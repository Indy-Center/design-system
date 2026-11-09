<script lang="ts">
  import { Callout, Citation, Prose } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const order = {
    name: "JO 7110.65",
    edition: "BB",
    url: "https://www.faa.gov/air_traffic/publications/atpubs/atc_html/",
  };
  // An Indy document the CMS holds as a file, with no address of its own.
  const sop = {
    name: "Indy Center SOP",
    edition: "Rev 2",
    file: { url: "/sample-sop.pdf" },
  };
  const notes = { name: "Controller notes" };
</script>

<Schemes>
  <Prose as="div">
    <p>
      Hold departures behind a heavy for two minutes, per
      <Citation source={order} at="3-9-6" />, and read the local rule in
      <Citation source={sop} at="Chapter 4" />.
    </p>
    <p>
      A source with neither a page nor a file: <Citation
        source={notes}
        at="Appendix B"
      />.
    </p>
    <Callout level="reference" class="my-5">
      <p>For more, see:</p>
      <ul>
        <li><Citation source={order} at="2-1-20" /></li>
        <li><Citation source={sop} at="Appendix B" /></li>
      </ul>
    </Callout>
  </Prose>
</Schemes>
