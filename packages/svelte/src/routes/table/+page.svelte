<script lang="ts">
  import { Link, Table, Th } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const controllers = [
    {
      callsign: "IND_83_CTR",
      frequency: "128.225",
      name: "Jane Doe",
      cid: 1234567,
    },
    {
      callsign: "IND_APP",
      frequency: "119.050",
      name: "Sam Lee",
      cid: 1500001,
    },
    {
      callsign: "SDF_TWR",
      frequency: "124.200",
      name: "Alex Kim",
      cid: 1600002,
    },
  ];
</script>

<svelte:head><title>Table · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Table</h1>

<Schemes>
  <div class="space-y-6">
    <Table>
      {#snippet caption()}Online controllers{/snippet}
      <thead>
        <tr>
          <Th scope="col">Callsign</Th>
          <Th scope="col">Frequency</Th>
          <Th scope="col">Controller</Th>
          <Th scope="col">CID</Th>
        </tr>
      </thead>
      <tbody>
        {#each controllers as c (c.cid)}
          <tr>
            <Th scope="row">{c.callsign}</Th>
            <td class="font-mono">{c.frequency}</td>
            <td><Link href="/roster/{c.cid}">{c.name}</Link></td>
            <td class="font-mono">{c.cid}</td>
          </tr>
        {/each}
      </tbody>
    </Table>

    <Table hideCaption>
      {#snippet caption()}Waitlist by course (caption hidden){/snippet}
      <thead>
        <tr>
          <Th scope="col" rowspan={2}>Course</Th>
          <Th scope="colgroup" colspan={2}>Students</Th>
        </tr>
        <tr>
          <Th scope="col">Waiting</Th>
          <Th scope="col">In training</Th>
        </tr>
      </thead>
      <tbody>
        <tr><Th scope="row">S1</Th><td>12</td><td>4</td></tr>
        <tr><Th scope="row">S2</Th><td>7</td><td>3</td></tr>
      </tbody>
    </Table>
  </div>
</Schemes>
