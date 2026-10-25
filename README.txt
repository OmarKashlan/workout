ROLLING UPPER/LOWER: OFFLINE WORKOUT APP
========================================

What this is
------------
A small web app that installs on your Android phone like a normal app and
works with no internet. Your program, logged sets and photos stay on your
phone. Works in English and Arabic (Settings > Language).

It needs to be put online once (free) so your phone can install it.


Step 1: Put it online for free (GitHub Pages, on a computer)
------------------------------------------------------------
1. Unzip this file. You get a folder called gym-app.
2. On github.com click "+" > "New repository". Name it: workout.
   Leave README off. Click "Create repository".
3. Click "uploading an existing file".
4. Open the gym-app folder, select everything inside it (index.html,
   app.js, the img folder and the rest) and drag it onto the page.
   Click "Commit changes".
5. Go to Settings > Pages. Under "Branch" choose "main" and "/ (root)",
   then Save. After a minute or two your link appears, like:
   https://YOUR-NAME.github.io/workout/

Updating: upload the new files to the same repository and replace the old
ones. The app updates the next time you open it online. Your data stays.


Step 2: Install on Android
--------------------------
1. Open your link in Chrome on your phone, with internet on.
2. Wait about 10 seconds so everything downloads.
3. Tap the three dots menu > "Install app" (or "Add to Home screen").
4. Open it once more while online. After that it works with no internet.


Using it
--------
Today     Your next session in the rotation. Tap a plate on the bar, or
          "Do a different session", to pick another one.
Workout   Every exercise starts with 2 sets. Type kg and reps, tap the
          tick. After 2 sets the app asks if you want set 3 (up to the
          target), or tap "Done with this exercise". Tapped Done by
          mistake? Open the exercise and tap "Undo done".
          Grey numbers are last time's; tap the tick without typing to
          reuse them. The rest timer starts by itself.
          Tap a photo to see it full screen, with Start and End buttons.
History   Every workout, and each exercise's progress over time.
Program   Add, edit, reorder or delete exercises and sessions.
Settings  Language, theme, your profile, easy weeks, backup and restore.


The AI coach
------------
You don't need to know what to ask.
1. Program > "Ask the AI coach". Pick what you want help with, for
   example "Check my progress and improve my program". Add a note if
   you like, then tap "Copy prompt".
2. Paste it into Claude or ChatGPT. The prompt already contains your
   profile (weight, height, back issue, goals), your whole program and
   all your logged sets.
3. Copy the coach's whole reply, go to Program > "Import reply", paste,
   tap "Check the import", then confirm.
Exercises that keep the same name keep their history.

Keep your profile up to date in Settings > Your profile. When your body
weight changes, update it there; the coach sees the trend.


Blocks and easy weeks
---------------------
Keep repeating Upper A > Lower A > Upper B > Lower B. After 8 weeks
(you can pick 6 to 12 in Settings) the app suggests an easy week:
2 sets per exercise and lighter weights. Then a new block starts.


Back up to Google Drive
-----------------------
Settings > "Back up" opens Android's share menu. Pick Drive to save the
file there. Do it every week or two. To restore on a new phone, install
the app, download the file from Drive and use Settings > Restore.


Credits
-------
Exercise photos and the exercise library: Free Exercise DB
(github.com/yuhonas/free-exercise-db), released into the public domain.
Fonts: Barlow Condensed and Cairo, SIL Open Font License.
