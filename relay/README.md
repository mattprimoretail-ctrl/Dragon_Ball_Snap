# Dragon Ball Snap relay: setting up friend matches

## What is this, and do I need it?

You only need the relay if you want to **play against a friend online**. Playing against the AI never needs it.

The game itself runs in each player's browser. The relay is a tiny program that sits on the internet and passes messages between the two players in a room, a bit like a switchboard. It never reads or saves your game. You set it up **once**, and then everyone uses it.

GitHub can host the game but cannot run the relay, so the relay goes on a separate free service. The easiest one is **Cloudflare** (free, always on, no credit card needed for what this uses). Follow Option 1 below.

When you are done you will have an address that looks like this:

    wss://dragon-ball-snap-relay.YOURNAME.workers.dev

That address is all the game needs.

---

## Option 1 (recommended): Cloudflare

This takes about 10 minutes the first time. You do not need to know how to code. You will copy and paste two commands.

### Step 1: Make a free Cloudflare account

1. Go to **dash.cloudflare.com/sign-up** and sign up with your email.
2. Open the email Cloudflare sends you and click the link to verify your address.

### Step 2: Install Node.js

Node.js is a free tool that runs the deploy command.

1. Go to **nodejs.org** and download the version marked **LTS**.
2. Run the installer and click Next until it finishes.
3. To check it worked, open a terminal (Step 3) and type `node -v`. You should see a version number like `v22.x.x`.

### Step 3: Open a terminal inside this `relay` folder

- **Windows:** open the `relay` folder in File Explorer, click the address bar at the top, type `cmd`, and press Enter. A black window opens.
- **Mac:** open the **Terminal** app, type `cd ` (the letters c, d, and then a space), drag the `relay` folder onto the Terminal window, and press Enter.

Everything below is typed into that window.

### Step 4: Log in to Cloudflare

Type this and press Enter:

    npx wrangler login

- If it asks "Ok to proceed?", type `y` and press Enter. It is just downloading Cloudflare's helper tool.
- Your web browser opens. Click **Allow**. Then go back to the terminal. It says you are logged in.

### Step 5: Deploy the relay

Type this and press Enter:

    npx wrangler deploy

- The first time, it may ask you to pick a **workers.dev subdomain**. Type any short name you like (letters and numbers), for example your first name.
- When it finishes it prints an address like `https://dragon-ball-snap-relay.YOURNAME.workers.dev`. **Copy it.**

### Step 6: Check that it is running

Paste that address into your browser. You should see a plain page that says:

    Dragon Ball Snap relay OK

If you see that, the relay is working.

### Step 7: Make your game address

Take the address from Step 5 and change `https://` to `wss://`. For example:

    https://dragon-ball-snap-relay.bob.workers.dev   becomes   wss://dragon-ball-snap-relay.bob.workers.dev

### Step 8: Tell the game about it (pick one)

- **Best, so nobody has to type anything:** open the `config.js` file in the main game folder and change it to:

      window.SNAP_RELAY = 'wss://dragon-ball-snap-relay.bob.workers.dev';

  Use your own address. Then upload the changed `config.js` to your GitHub repository (open it on GitHub, click the pencil icon or **Add file → Upload files**, and commit). Your friends get it automatically the next time they open the game.
- **Or:** each player taps **Play a friend** in the game, pastes the address into the **Server address** box, and taps **Create a room** or **Join**. The game remembers it.

### Step 9: Play

1. One player opens the game and taps **Play a friend**, then **Create a room**. A 4-letter room code appears.
2. Tell your friend the code (text it, for example).
3. Your friend opens the game, taps **Play a friend**, types the code, and taps **Join**.
4. The match starts. The host can pick a turn timer in the lobby before creating the room.

---

## Option 2: Run it on your own computer (for testing, or the same Wi-Fi)

You need Node.js (Step 2 above). No account needed.

1. Open a terminal in this `relay` folder (Step 3 above).
2. Type `node snap-relay-server.js` and press Enter. It says `Dragon Ball Snap relay listening on port 8787`. Leave the window open while you play.
3. On the **same computer**, the game address is `ws://localhost:8787`.
4. For a friend on **the same Wi-Fi**, use your computer's local address, for example `ws://192.168.1.20:8787`. Find your computer's local address in your network settings. Windows: type `ipconfig` in the terminal and look for "IPv4 Address".

Important: a game opened from an `https://` link (such as GitHub Pages) is not allowed to connect to a plain `ws://` address on another machine. For that, either use Option 1, or open the downloaded `index.html` file from your computer instead of the web link.

## Option 3: Another free host that runs Node (Render, Railway, Fly.io)

Create a new "web service" from this folder, set the start command to `node snap-relay-server.js`, and leave the port alone (the host sets it). These hosts already give you `https`, so your game address is `wss://your-app-name.onrender.com`. Free plans on some of these hosts go to sleep when nobody is using them, so the first connection can take a minute. That is why Cloudflare is the recommended option.

---

## If something goes wrong

| What you see | What to do |
|---|---|
| `npx` or `node` is "not recognized" or "command not found" | Install Node.js (Step 2), close the terminal, and open a new one. |
| Wrangler asks you to log in again | Run `npx wrangler login` once more. |
| The relay address in your browser does not say "Dragon Ball Snap relay OK" | Run `npx wrangler deploy` again and check for error messages. Make sure you ran it inside the `relay` folder. |
| "That server address does not look right" in the game | It should start with `wss://` and have no spaces. Check you changed `https://` to `wss://`. |
| "Room not found. Check the code." | The host has to create the room first. Check the 4 letters, and that the host's window is still open. |
| "That room code is already in use" | The host should create a new room to get a fresh code. |
| "You and your friend have different versions of the game" | Both players need the same version. Ask your friend to refresh the page (or download the newest file). |
| Cannot connect at all | Check the address with the browser test in Step 6. Players on the GitHub link must use `wss://`. A plain `ws://` address will not work from an `https://` page. |
| The match stops when someone closes the page or loses signal | That player forfeits. Start a new room. |

## Good to know

- You can update or remove the relay any time from your Cloudflare dashboard (**Workers & Pages**).
- A few friends playing is far below Cloudflare's free limits. If you ever share it widely, check Cloudflare's current free plan limits.
- The relay does not save anything. Each player's progress stays on their own device.
