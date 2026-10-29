<script lang="ts">
  // The tokens package's tables.md (its brand colours and roles, as the
  // brand guide shows them), each value beside a swatch drawn from its
  // custom property: a Light or Hex column's on the light page, a Dark
  // column's in data-theme="dark".
  import tables from "@indy-center/centerline-tokens/tables.md?tables";
  import { Heading, Link, PageHeader, Table, Th } from "../../../lib/index.ts";
  import { TOKENS } from "../../../playground/site.ts";

  const [brand, roles] = tables;

  // `#0369A1` in the Markdown: shown as code.
  const code = (cell: string) => cell.match(/^`(.*)`$/)?.[1];

  // The token a row names: Sky is --color-sky, `card` --color-card.
  const variable = (row: string[]) =>
    `--color-${(code(row[0]) ?? row[0]).toLowerCase()}`;

  const swatch = (column: string) =>
    ["Hex", "Light", "Dark"].includes(column) ? column : undefined;
</script>

<PageHeader title={TOKENS.label}>
  {TOKENS.summary} Their values come from the
  <Link href="https://brand.flyindycenter.com">brand guide</Link>; the tech docs
  say <Link href="https://tech.flyindycenter.com/design/"
    >which role to use where</Link
  >.
</PageHeader>

{#each [{ heading: "Brand colours", table: brand }, { heading: "Roles", table: roles }] as { heading, table } (heading)}
  <Heading level={2} class="mt-10 mb-4">{heading}</Heading>
  <Table hideCaption>
    {#snippet caption()}{heading}{/snippet}
    <thead>
      <tr>
        {#each table.header as column (column)}
          <Th scope="col">{column}</Th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each table.rows as row (row[0])}
        <tr>
          {#each row as cell, i (i)}
            {@const column = swatch(table.header[i])}
            {#if i === 0}
              <Th scope="row"
                >{#if code(cell)}<code class="font-mono">{code(cell)}</code
                  >{:else}{cell}{/if}</Th
              >
            {:else if column}
              <td class="whitespace-nowrap">
                <span
                  data-theme={column === "Dark" ? "dark" : undefined}
                  class="mr-2 inline-block size-5 rounded border border-border align-middle"
                  style:background-color="var({variable(row)})"
                ></span><code class="font-mono">{code(cell) ?? cell}</code>
              </td>
            {:else}
              <td>{cell}</td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </Table>
{/each}
