# Paper Maths · Cambridge Primary Stage 6 revision site

A static, single-page revision website for Cambridge Primary Mathematics Stage 6:

- **Units 1–17 boards**: topics with picture cards (Learn), Practise questions and Units 1–2 exam questions.
- **Checkpoint board**: 12 papers (April/October 2023–2025, Paper 1 and Paper 2).
- **Progression Test board**: 10 papers (2022–2026, Paper 1 and Paper 2).
  - Together the two boards hold 653 questions.
- **Answer on the question**: typing boxes on dotted lines and empty boxes, tick boxes, ring-able choices labelled A/B/C…, matching dots, and pen / line / ring drawing tools.
- **Answer reveal**: after "I'm done ✓" the child presses "Show the answer". They see the answer, the method as numbered steps, and a diagram where useful, then mark themselves ✓/✗.
- **My mistakes**: every ✗ is grouped by topic, with the theory cards for that topic and links back to the questions.
- **Parent tools**:
  - several learners
  - progress tables
  - *Parent mode*, to correct any answer, method or topic
  - *Import exercises*, to add new papers from screenshots
  - *Backup / Load backup*, as a JSON file

There is **no server and no database server**. Everything is static files. All user data lives in the browser:

| What | Where |
|---|---|
| Learners, progress, answers, drawings, ✓/✗, parent corrections (`edits`), parent mode | `localStorage` key `stage6-maths-rev-v3` |
| Imported papers (pictures + answers) | IndexedDB database `paper-maths-custom`, object store `papers` |
| Backup file | JSON `{app:"paper-maths", v:1, db:<localStorage object>, custom:[<imported papers>]}` |

---

## Quick start

```bash
python3 build.py          # Python 3.8+, standard library only
# then serve dist/web with any static server, e.g.
python3 -m http.server -d dist/web 8080
```

Build outputs:

| Output | Use |
|---|---|
| `dist/web/index.html` + `dist/web/pdata/*.js` | **Deploy this folder.** About 7.6 MB of HTML plus 22 picture bundles (about 0.3–1 MB each), loaded only when a paper is opened. |
| `dist/offline/Paper_Maths.html` | One file of about 19.5 MB with everything inline. It works by double-click, with no internet. |

### Deploy
`dist/web` is plain static content. It runs on Netlify, Vercel (static), GitHub Pages, Cloudflare Pages, S3 + CloudFront, or nginx.
- No build step is needed on the host. Commit `dist/web`, or run `python3 build.py` in CI.
- Routing uses the URL hash (`#home`, `#unit6`, `#s6-2`, `#checkpoint`, `#p-cp2025o1`, `#mistakes`, `#import`, `#parent` …), so no rewrite rules are needed.
- Enable gzip/brotli. The HTML is mostly base64 images and JSON and compresses well.

---

## Sync backend (optional, Express + SQLite)

`server/` is a small Express 5 app that serves the built site and keeps progress and imported papers in a SQLite file, so every device that opens the same server sees the same data. Without the server the site still works from browser storage alone.

```bash
npm install
npm run build      # python build.py, writes the web build
npm start          # http://localhost:8080  (PORT, HOST and DB_FILE can be set; default DB: data-store/app.db). Needs Node 22.5+ (uses the built-in `node:sqlite`)
npm test           # API tests
```

| Route | Purpose |
|---|---|
| `GET/PUT /api/state` | The whole `localStorage` object. Last write wins by `updatedAt`. |
| `GET /api/papers`, `PUT/DELETE /api/papers/:id` | Imported papers (IndexedDB records). |

Live: https://paper-maths.thceramics.admirable.site (CentOS 7, nginx, systemd unit `paper-maths`, settings in `/etc/paper-maths/environment`, database `/opt/paper-maths/data-store/app.db`). To deploy: `python build.py`, `python deploy/pack.py out.tgz`, copy it to `/tmp/pm.tgz` on the server and run `deploy/server-setup.sh` there (first-time setup, also updates the files). After the first time, extract the archive into `/opt/paper-maths`, run `npm ci --omit=dev` and `systemctl restart paper-maths`.

The browser side is `src/sync.js`. There is no login: run the server on a home or school network, or behind your own access control, not open on the internet. Deleting an imported paper on one device does not remove a copy that another device still holds locally.

---

## Folder layout

```
build.py                 build script (src + data -> dist)
src/
  shell.html             page skeleton with /*@@DATA@@*/ and /*@@CODE@@*/ placeholders
  theme.css              paper-collage theme (torn edges, tape, textures, all components)
  mkshell.py             inlines theme.css + noise textures into shell.html -> shell4.html (build temp)
  data.js                Units 1–2: UNITS, SUBS (topics), QT (question types), PRACTICE, TESTS,
                         marking helpers (parseNum, mark, markItem …), GUIDE cards, INVEST, EXTRA
  data2.js               Units 3–17: UT2, ST2, SUBC2, UNITSUBS2, CARDS (picture-card metadata)
  cimg.js                CIMG – 166 picture cards for Units 3–17 (WebP data URIs)
  diag.js                SVG diagram renderers DR.{pv,shift,chain,nl,range,order,jumps,pt,grid,sq,cube,venn,mult,factors,flow}
  sol.js                 worked solutions for the Units 1–2 exam/practice items (SOL)
  prac2.js               Units 3–4 self-check practice
  interact.js            "answer on the question" layer: overlays, tools (pen/line/ring), ink storage, pAnsBox
  extra.js               parent edits, topics, Import page (IndexedDB), backup, My mistakes page
  papers_app.js          Checkpoint / Progression boards, paper player, solution renderer (solBlock)
  app5.js                main app: storage, learners, header/footer, home, unit/topic pages, tests, parent page, router
data/
  papers.json            22 papers: id, board (C/P), year, ses, paper, qs[{n, crops[], marks, text, pages}]
  sol/<paperId>.js       answers + methods per paper (see format below)
  img/<paperId>_qNN_K.webp  662 question pictures cropped from the PDFs (794 px wide)
  overlays.json          auto-detected answer spots per picture (see format below)
  topics.json            topic (e.g. "6.2") for every paper question: {"cp2025o1-7": "9.1", …}
  exam_items.json        121 Units 1–2 exam items used on the topic pages
  exam/<id>.webp         pictures for those 121 items
  guide/v<page>.webp     Units 1–2 Visual Maths Guide page images
tools/
  validate_solutions.js  node tools/validate_solutions.js  -> checks every solution renders
  pipeline/              one-off scripts used to produce data/ (cropping, overlay detection, topic tagging)
dist/                    build output (generated)
```

Paper ids: `cp<year><a|o><paper>` is Checkpoint (`a` = April, `o` = October) and `pt<year>p<paper>` is Progression Test.
For example, `cp2025o1` is Checkpoint October 2025 Paper 1 and `pt2024p2` is Progression Test 2024 Paper 2.

---

## Data formats

### Solutions – `data/sol/<paperId>.js`
```js
S.cp2025o1={
  1:{a:'121', s:['Split 847 into easy parts: 700 + 140 + 7','700 ÷ 7 = 100 · 140 ÷ 7 = 20 · 7 ÷ 7 = 1','100 + 20 + 1 = 121']},
  7:{a:'False · True · False · True', s:[…], d:[['grid',{head:['Number','1','2'],rows:[['Sections','3','3']]}]]},
};
```
- Each entry is keyed by question number.
- `a` is the answer (shown in the green box).
- `s` is the method steps (shown as numbered boxes).
- `d` is optional diagrams: `[rendererName, options]`, rendered by `DR[name](options)` in `src/diag.js`.
- Run `node tools/validate_solutions.js` after editing; it renders every diagram and reports errors.

**Important:** the source PDFs contained no mark schemes. Every answer was worked out for this site. Answers that need measuring (angles, drawings) are approximate (±2°). Parents can override any answer in the browser (Parent mode). To fix an answer permanently, edit the file here and rebuild.

### Answer-spot overlays – `data/overlays.json`
```json
"cp2025o1_q07_0.webp": {"w":794,"h":512,
  "dot":[[x,y,width]],            // dotted answer line -> text input (y = baseline of the dots)
  "box":[[x,y,w,h]],              // empty box -> text input, or tick box when the question says "Tick (✓)"
  "ch":[[x,y,w,h]],               // picture choices -> labelled A, B, C… in this order, click to ring
  "opt":[[x,y,w,h]],              // number/word options -> click to ring
  "md":[[x,y]]}                   // matching dots (click dot -> dot/anywhere draws a line)
```
- Coordinates are in pixels of the picture. The front end converts them to percentages, so overlays scale with the picture.
- They were detected automatically with OpenCV (`tools/pipeline/overlay_*.py`). Picture choices (`ch`) were checked by hand.
- **The A/B/C letters in the answers of 18 picture-choice questions depend on the order of `ch`.** If you reorder it, update those answers.
- To fix a missed or wrong spot, edit the coordinates for that picture and rebuild.

### Topics – `data/topics.json`
- This file maps each paper question to a topic id in `SUBS` (`data.js`, e.g. `"6.2"` = Percentages). It drives the My mistakes page and the "Read the theory" links.
- It was made by keyword rules (`tools/pipeline/topic_classify.py`) and is roughly 80% accurate.
- Correct entries here, or per browser via Parent mode → ✎ Edit answer → Topic.

### Imported papers (IndexedDB record)
```js
{id:'u<base36 time>', title, board:'C'|'P', year, ses:'', paper:1,
 qs:[{n, crops:['<id>_q1'], marks, t:'6.2', sol:{a:'', s:['step', …]}}],
 imgs:{'<id>_q1':{d:'data:image/webp;base64,…', w, h}}}
```
These records are mounted into `PAPERS` / `PBY` / `PIMG` / `GEO` at start-up (`mountCustom` in `extra.js`). After that they behave like built-in papers.

### localStorage (`stage6-maths-rev-v3`)
```js
{learners:[{id,name}], current, mapOverride:{}, parentMode:bool,
 edits:{<paperId>:{<n>:{a?, s?, t?, keepD?}}},           // parent corrections (shared by all learners)
 data:{<learnerId>:{seen, tried, first, last, exam, tests, ans, fin, lastSub,
        pp:{<paperId>:{<n>:'yes'|'no'}}, ppos:{<paperId>:n},  // paper self-marks & position
        ov:{<qid>:{v:{}, s:[strokes], m:[match lines], h:[]}}, // answers typed/ticked/drawn on the picture
        wlog:{<topic>:count}}}}                                // how many times each topic was marked wrong
```
`qid` = `<paperId>-<n>`. Ink strokes are stored in picture pixel coordinates.

---

## How the code fits together

- `build.py` inlines all data into the constants `EXAM`, `VIMG`, `QIMG`, `PAPERS`, `PTOPIC`, `GEO`, `PSOL`, then the `src/data*.js` files.
- After the data come the code files, in this order: `diag → sol → prac2 → interact → extra → papers_app → app5`.
- `app5.js` ends by calling `render()`. The router lives in `render()` and reads `location.hash`.
- Main entry points to change things:
  - **Header/nav:** `header()` in `app5.js`.
  - **Home page:** `viewHome()` in `app5.js`; the board tiles come from `boardTiles()` in `papers_app.js`.
  - **Boards and paper player:** `viewBoard()`, `viewPaper()` and `solBlock()` in `papers_app.js`.
  - **Answer-on-picture layer:** `cropHTML()`, `bindInteract()` and `pAnsBox()` in `interact.js`.
  - **Mistakes, Import, Backup, answer editor:** `extra.js`.
- Styling is all in `src/theme.css`. The `.t1–.t4` torn-paper clip paths are appended by `mkshell.py`.

### Ideas for the next steps (not done)
- A real backend (e.g. Supabase or Firebase) so progress and parent corrections sync across devices instead of Backup files.
- PDF import (pdf.js) with a crop tool. Today import takes images or screenshots.
- Split `index.html` further, e.g. lazy-load the Units 3–17 card images (`cimg.js`, about 4 MB), for faster first load on phones.
- Review `topics.json` and the auto-detected overlays question by question.

## Not included
- The original PDFs (Checkpoint and Progression Test papers, Visual Maths Guides) are not in this zip. They are the client's source files, needed only to re-crop pictures.
- The scripts in `tools/pipeline/` are kept for reference. Some still contain the original absolute paths; adjust them if you re-run the pipeline.
- The question pictures and the Visual Maths Guide images are taken from Cambridge-style test papers and the client's guides. Check usage rights before deploying the site publicly.
