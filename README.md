# Classic Klondike Solitaire - Schnaps Edition 🥃

A responsive, standalone Klondike Solitaire browser game featuring custom Schnaps shot glass and droplet suits, authentic pip arrangements, illustrated court cards, multilingual support, and guaranteed solvable deals. Built with pure vanilla HTML5, CSS3, and JavaScript.

---

## 🥃 Two Colors, Four Symbols: Shot Glasses & Drops

To maximize gameplay clarity and honor traditional Solitaire alternating rules, the deck features **two distinct card colors: Black and Green**, with one **Shot Glass** and one **Drop** in each color:

### 🖤 Black Team:
- ♣ **Clubs**: **Black Shot Glass** (Jet-black licorice liquor in a heavy silver/chrome-trimmed glass with specular reflections).
- ♠ **Spades**: **Black Drop** (Dark herbal / licorice liqueur droplet with glossy highlight contour).

### 💚 Green Team:
- ♦ **Diamonds**: **Green Shot Glass** (Vibrant emerald mint Pfeffi in an emerald-trimmed glass with rising carbonation bubbles).
- ♥ **Hearts**: **Green Drop** (Radiant emerald mint schnaps droplet with translucent specular glint).

### 🔄 The Alternating Color Rule (Black ⇄ Green):
In Klondike, tableau cards must alternate in color. In the Schnaps Edition:
- **Black cards (Shot Glass ♣ or Drop ♠)** can only be placed onto **Green cards (Shot Glass ♦ or Drop ♥)**.
- **Green cards (Shot Glass ♦ or Drop ♥)** can only be placed onto **Black cards (Shot Glass ♣ or Drop ♠)**.
- The corner ranks are clearly color-coded (**Black** or **Green**) so you can scan the board at a glance!
- A handy legend is displayed at the bottom of the table felt for quick reference.

---

## 🎴 Card Design & Face Layout

- **Rank-Only Corners**: Corner indices display **only the rank number or letter** (`A`, `2`–`10`, `J`, `Q`, `K`) in top-left and bottom-right in bold Black or Green.
- **Uniform Pip Sizing (2 to 10)**: All number cards (2 through 10) share the exact same icon dimensions, calibrated to the benchmark size of card 3. Aces (1) feature a prominent showcase symbol in the center.
- **Court / Picture Cards (J, Q, K)**: Rich vector portraits of royal characters holding up their suit's drinking vessel in a celebratory toast, with bottom banners localized to the active language (e.g. BUBE / DAME / KÖNIG in German, JACK / QUEEN / KING in English, etc.):
  - **Jack (J)**: Young dashing squire/knight in a cavalier feathered beret raising the vessel.
  - **Queen (Q)**: Elegant crowned queen with pearls and royal robe gracefully holding the vessel.
  - **King (K)**: Majestic bearded king with a jeweled golden crown raising the vessel in a royal toast.

---

## 🌐 Multilingual Support (i18n)

- **German Standard**: German (`de`) is the default language upon first load.
- **Instant Language Switching**: Switch on-the-fly between 6 languages from the header dropdown without restarting your game:
  - 🇩🇪 **Deutsch** (Standard)
  - 🇬🇧 **English**
  - 🇪🇸 **Español**
  - 🇷🇺 **Русский**
  - 🇸🇪 **Svenska**
  - 🇮🇹 **Italiano**
- All UI elements, rules legend, scoreboards, toasts, and court card ribbons instantly reflect the chosen language.

---

## 🪵 Natural Oak Wood Default & Felt Styles

- **Oak Wood Tabletop Standard**: Authentic natural oak tabletop texture with rich organic wood grain, knots, and warm amber tavern ambient lighting as the default surface.
- **Additional Felts**: Switchable to **Emerald Classic**, **Royal Navy**, **Burgundy Velvet**, **Slate Charcoal**, and **Deep Violet**.

---

## 🚀 Key Features

### 📱 Full Mobile & Touch Support
- Complete responsive 7-column layout optimized for smartphones and tablets.
- Pointer Events touch drag-and-drop with cascading substacks.
- Quick Foundation sweep via button, right-click, or double-tapping the table felt.

### 🖱️ Foundation Quick Sweep
- Tap **⚡ Sweep**, right-click anywhere on the board, or double-tap the table felt to send all eligible cards directly to Foundations.
- Grouped into a single undo step.

### 🏆 Player Names & Two Dedicated High Score Boards (Top 100 Each)
- **Two Distinct Leaderboards**:
  - **🃏 Draw 1 Board** (Top 100 scores)
  - **🃏 Draw 3 Board** (Top 100 scores)
- Persistent player names and high score tracking via `localStorage`.

### 🌟 Guaranteed Solvable Mode
- Every new game is mathematically verified through an in-engine forward solver to guarantee a winnable path.
- Toggle between **🌟 Solvable** and **🎲 Random** in the top bar.

### 🔊 Authentic Tavern Audio & Music Playlist
- **4-Track Irish Pub Folk Playlist**: High-spirited acoustic pub folk session tracks playing in continuous variety rotation, with skip-to-next button and title info in Settings.
- **Card Sounds**: Flip, draw, snap, and sweep sounds synthesized with Web Audio.
- **Drinking Sounds**: Real human sip and swallow variations on Foundation scoring.
- **Victory Fanfare**: Brass fanfare and celebration fireworks upon winning.
