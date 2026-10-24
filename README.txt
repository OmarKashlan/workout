ROLLING UPPER/LOWER: OFFLINE WORKOUT APP
========================================

What this is
------------
A small web app that installs on your Android phone like a normal app and
works with no internet. Your program, logged sets and photos stay on your
phone. Nothing is sent anywhere.

It needs to be put online once (free) so your phone can install it.


Step 1: Put it online for free (GitHub Pages, on a computer)
------------------------------------------------------------
1. Unzip this file. You get a folder called gym-app.
2. Make a free account at github.com, if you don't have one.
3. Click "+" (top right) > "New repository".
   Name it: workout. Leave it Public. Click "Create repository".
4. On the next page click "uploading an existing file".
5. Open the gym-app folder, select everything inside it
   (index.html, app.js, the img folder and the rest) and drag it
   onto the page. Wait for the upload to finish, then click
   "Commit changes".
6. Go to Settings > Pages. Under "Branch" choose "main" and "/ (root)",
   then Save.
7. After a minute or two the page shows your link, like:
   https://YOUR-NAME.github.io/workout/

(Another free option: Netlify Drop at app.netlify.com/drop. Sign up or
log in first, then drag the gym-app folder onto the page.)


Step 2: Install on Android
--------------------------
1. Open your link in Chrome on your phone, with internet on.
2. Wait about 10 seconds so everything downloads.
3. Tap the three dots menu > "Install app" (on some phones it says
   "Add to Home screen").
4. Open it from your home screen once more while online. After that it
   works in the gym with no internet.


Using it
--------
Today     Shows your next session in the rotation. Tap a plate on the
          bar, or "Do a different session", to pick another one.
Workout   Tap an exercise to open it. Type kg and reps, then tap the
          tick. Grey numbers are what you did last time; tap the tick
          without typing to reuse them. The rest timer starts by itself.
          For bodyweight work only reps are logged. For assisted
          pull-ups, log the assistance as a negative weight (e.g. -20).
History   Every workout, and each exercise's progress over time.
Program   Add, edit, reorder or delete exercises and sessions.
Settings  Dark or light theme, keep screen on, ease-in weeks, backup
          and restore.


Adding exercises with AI
------------------------
1. Program > "Copy prompt for AI".
2. Paste it into Claude (or any AI) and add what you want, for example:
   "Add face pulls to Upper B" or "Swap leg extensions for sissy squats".
3. Copy the AI's whole answer, go to Program > Import, paste, tap
   "Check the import", then confirm.
Exercises that keep the same name keep their history.

Or add one by hand: Program > "Add exercise" and search the built-in
library of 873 exercises (works offline).

Photos for exercises you add download the next time you open the app
with internet. Settings > "Photos for offline use" shows how many are
saved and has a "Download now" button. You can also use your own photo.


Back up now and then
--------------------
Your data lives only on this phone. Settings > "Back up" saves a file to
your Downloads. If you change phones or clear Chrome's data, install the
app again and use "Restore".


Updating the app later
----------------------
If you get a new version of these files, upload them to the same GitHub
repository (replace the old ones). The app updates itself the next time
you open it online, and your data stays.


Credits
-------
Exercise photos and the exercise library: Free Exercise DB
(github.com/yuhonas/free-exercise-db), released into the public domain.
Font: Barlow Condensed, SIL Open Font License.
