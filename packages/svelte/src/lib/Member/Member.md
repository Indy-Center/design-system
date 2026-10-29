---
title: Member
description: A member's name, then their CID muted in mono: "Jordan Sample · CID 1000001".
---

## Checklist

- [ ] Use it wherever a page names a member: a roster, an event's
      positions, feedback, who's online. Don't write the name and CID
      yourself, in any of today's other formats.
- [ ] Pass `name` as the page should show it. The app works it out from
      its own data (preferred name, then first and last); `Member` never
      looks it up.
- [ ] For a member with name privacy, pass their first name alone. Nothing
      takes the last name's place: not the CID.
- [ ] Decide for each place whether the CID shows: `showCid={false}` where
      it adds nothing, such as who's online or a position's people. It
      shows by default.
- [ ] Pass `href` to link the name, such as to the member's profile. The
      CID isn't part of the link.
- [ ] Don't colour it or set its font: the name takes the text around it.
      `class` is for layout only.

## Use

```svelte
<script>
  import { Member } from "@indy-center/centerline-svelte";
</script>

<!-- Jordan Sample · CID 1000001 -->
<Member name="Jordan Sample" cid={1000001} href="/roster/1000001" />

<!-- Jordan Sample -->
<Member name="Jordan Sample" cid={1000001} showCid={false} />
```

## Props

| Prop      | Type               | Notes                                                                         |
| --------- | ------------------ | ----------------------------------------------------------------------------- |
| `name`    | `string`           | Required. The name as shown; for a name-private member, the first name alone. |
| `cid`     | `number \| string` | Required. The member's VATSIM CID.                                            |
| `showCid` | `boolean`          | `true` by default. `false` leaves the CID out.                                |
| `href`    | `string`           | Links the name, as `Link`.                                                    |
| `class`   | `string`           | Layout only, on its root.                                                     |
| others    | global attributes  | `id`, `aria-*` and the rest, on its root `<span>`.                            |

## Looks

- The name: the colour and font of the text around it, or `Link`'s look
  with `href`.
- ` · CID 1000001`: `text-sm`, `muted-foreground`, the number in
  `font-mono`, kept on one line. It passes 4.5:1 on the page and on a
  card in every scheme.

## Accessibility

- A `<span>` of text, with an `<a>` round the name when given `href`.
- The `·` is hidden, so a screen reader reads "Jordan Sample CID
  1000001". Readers say the CID as a large number; that's fine in a list.
