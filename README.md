# FocusPulse Cloud (GitHub Pages + Firebase Realtime Database)

Deploy your personal FocusPulse PWA to GitHub Pages so your iPhone web app is hosted **24/7 in the cloud**, completely independent of your Mac or phone.

---

## ⚡ 1. Deploy Website to GitHub Pages (100% Free · 2 Minutes)

1. Go to [github.com/new](https://github.com/new) and create a **Public** repository named `focuspulse` (or any name you like).
2. Upload the 3 files in this `docs/` folder (`index.html`, `manifest.json`, `sw.js`) to your repository.
   - Or push from terminal:
     ```bash
     cd /Users/ahmadluai/Documents/MyMac/Widget/docs
     git init
     git add .
     git commit -m "Deploy FocusPulse PWA"
     git branch -M main
     git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/focuspulse.git
     git push -u origin main
     ```
3. In your GitHub repository:
   - Go to **Settings** → **Pages** (under Code and automation in the left sidebar).
   - Under **Build and deployment** → **Source**, select **Deploy from a branch**.
   - Select Branch: `main` / `root` (or `/docs`), and click **Save**.
4. In ~30 seconds, your website is live 24/7 at:
   `https://<YOUR_GITHUB_USERNAME>.github.io/focuspulse/`

---

## ⚡ 2. Get Free Firebase Realtime Database URL (60 Seconds · No Credit Card)

1. Open [console.firebase.google.com](https://console.firebase.google.com) and sign in with your Google account.
2. Click **Create a project** (name it `focuspulse`, disable Google Analytics, click Create).
3. In the left sidebar, click **Build** → **Realtime Database** → **Create Database**.
4. Choose any location (e.g. `United States`) → click Next.
5. Choose **Start in test mode** (allows read/write) → click **Enable**.
6. Copy your Database URL at the top of the page. It looks like:
   `https://<your-project-id>-default-rtdb.firebaseio.com`

---

## ⚡ 3. Connect Mac and iPhone

1. In the FocusPulse Mac menu bar app, open the **Sync** sheet and select **GitHub Cloud**.
2. Paste your Firebase Database URL into the box.
3. Your Mac will generate a direct QR code:
   `https://<YOUR_GITHUB_USERNAME>.github.io/focuspulse/?db=https://<your-project-id>-default-rtdb.firebaseio.com`
4. Scan the QR code with your iPhone Camera (or open the link in Safari).
5. Tap **Share (⎋)** → **Add to Home Screen**.

🎉 **You're done!** Your timer, 24-hour timeline, tasks, and notes now sync seamlessly across your Mac and iPhone through the cloud without depending on your Mac staying awake.
