# Bargain Radar — Black Friday deals, checked today

![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)
![rank](https://make.fun/badge/black-friday-deal-finder-01/muammarkhadafi/makefun-black-friday-deal-finder/rank.svg)
![reward](https://make.fun/badge/black-friday-deal-finder-01/muammarkhadafi/makefun-black-friday-deal-finder/reward.svg)

A static deal finder of real Black Friday and Cyber Monday deals, for the
[make.fun bounty](https://make.fun/bounty/black-friday-deal-finder-01).

31 deals from 6 stores (Amazon, Best Buy, Walmart, Target, Costco, Kate Spade
Outlet), each with its product, store, store link, sale price, usual price,
discount and the time the price was checked on 27 November 2026. Every deal
carries an honest verdict — New low, Strong deal or Routine cut — with the
evidence behind it. Search and filters by category, store and discount work,
and the best deals sort first.

## Entry

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with the vendored make.fun
library.

Run it locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Serve the site locally with `node serve.ts`, then open http://localhost:8080.
