# Dragon Ball Snap

A fast Dragon Ball card battle game for your phone or computer. Place cards in three lanes, win two of them, snap to raise the stakes, and spend your Zeni unlocking every fighter in the Card Tree. Play against the AI or against a friend online.

This is an unofficial fan project, made for fun and not for sale. Dragon Ball and its characters belong to their respective owners.

## Put it on GitHub and share one link (recommended)

1. Make a free account at github.com, then click **New repository**. Name it something like `dragon-ball-snap`, keep it **Public**, and click **Create repository**.
2. Click **uploading an existing file**, drag in **everything from this folder** (including the `icons` and `relay` folders, and the hidden `.nojekyll` file if your computer shows it), and click **Commit changes**. The big `index.html` is about 14 MB, which is fine.
3. Open the repository's **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, pick **main** and **/ (root)**, then **Save**.
4. Wait a minute or two. Your game is now live at `https://YOURNAME.github.io/dragon-ball-snap/`. Send that link to your friends.

## Install it like an app

Open the link once while online. After that it also works offline (except friend matches).

- **Android (Chrome):** open the game, go to the browser menu, and tap **Install app** or **Add to Home screen**. The game's own **Options** screen also shows an install button.
- **iPhone / iPad (Safari):** tap **Share**, then **Add to Home Screen**.
- **Windows / Mac / Chromebook (Chrome or Edge):** click the install icon at the right end of the address bar, or open the menu and choose **Install Dragon Ball Snap**.

An installed copy updates itself: whenever you push a new `index.html` to GitHub, players get it the next time they open the game while online.

## Just save the game (no website needed)

- On the repository page click the green **Code** button, then **Download ZIP**, unzip it, and double-click **index.html**. It runs in any modern browser with no install and no internet.
- Or, from the live link, use your browser's **Save page as…** to keep a copy.
- Each device keeps its own progress. To move progress between devices, use **Options → Save code**.

## Friend matches (online)

Friend matches need a tiny relay server that passes messages between the two players. It never reads or stores game data. The folder `relay/` has everything. Open `relay/README.md` for a slow, step-by-step guide that assumes you have never done this before (the free Cloudflare option takes about ten minutes).

After you deploy it:

1. Open `config.js` and put your address in it, like this:
   `window.SNAP_RELAY = 'wss://dragon-ball-snap-relay.YOURNAME.workers.dev';`
2. Upload the changed `config.js` to GitHub. Now nobody has to type a server address. Players tap **Play a friend**, one creates a room, and the other joins with the 4-letter code.

Pages on `https://` can only use `wss://` addresses, which is what Cloudflare gives you. Both players need the same version of the game.

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The whole game, with all art and sound inside |
| `manifest.webmanifest`, `sw.js`, `icons/` | Make it installable and let it work offline |
| `config.js` | Optional: your friend-match relay address |
| `relay/` | The friend-match relay server |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

## Making an Android .apk

GitHub Pages plus the install steps above is the simplest route and works on every device. If you really want an `.apk` file, the free tool **pwabuilder.com** can wrap your live link into an Android package. An iPhone app in the App Store needs a paid Apple developer account, so the Add to Home Screen route is the practical one there.
