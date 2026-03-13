# iPhone Shortcuts: Hidden Folder Vault

A sophisticated Shortcuts app automation that creates a disguised, password-protected
hidden folder system on your iPhone. The shortcut masquerades as an innocent utility
(like a "Battery Health Check") but actually opens a locked-down private file area
inside the Files app using a multi-layer authentication gate.

---

## Architecture Overview

```
┌─────────────────────────────────┐
│  Home Screen Shortcut Icon      │
│  "Battery Health Check"         │
│  (disguised name + icon)        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  LAYER 1: Decoy Prompt          │
│  Shows fake "Checking battery"  │
│  notification for 2 seconds     │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  LAYER 2: Biometric/Passcode    │
│  Triggers Face ID / Touch ID    │
│  via Lock Screen authentication │
└──────────────┬──────────────────┘
               │
          ┌────┴────┐
          │ Failed? │──────► Show fake "Battery OK" alert, exit
          └────┬────┘
               │ Success
               ▼
┌─────────────────────────────────┐
│  LAYER 3: Secret PIN Entry      │
│  "Enter diagnostic code"        │
│  (custom 4-6 digit PIN)        │
└──────────────┬──────────────────┘
               │
          ┌────┴────┐
          │ Wrong?  │──────► Show fake "Battery OK" alert, exit
          └────┬────┘
               │ Correct
               ▼
┌─────────────────────────────────┐
│  LAYER 4: Open Hidden Folder    │
│  Navigates to deeply nested     │
│  folder in Files / iCloud Drive │
└─────────────────────────────────┘
```

---

## Part 1: Create the Hidden Folder Structure

### Step 1 — Set Up the Nested Folder in Files

1. Open the **Files** app on your iPhone.
2. Navigate to either **On My iPhone** or **iCloud Drive** (iCloud Drive syncs across
   devices; On My iPhone keeps it local only).
3. Tap and hold on empty space, then tap **New Folder**.
4. Name it something completely boring and system-looking:
   ```
   .system_cache
   ```
   > Note: Starting with a dot makes it feel like a system directory. iOS will still
   > show it, but nobody browsing your files would think to open it.
5. Open `.system_cache` and create another folder inside it:
   ```
   thermal_data
   ```
6. Open `thermal_data` and create one more:
   ```
   logs_2024
   ```
7. Open `logs_2024` and create the final destination folder:
   ```
   vault
   ```

Your full hidden path is now:
```
iCloud Drive/.system_cache/thermal_data/logs_2024/vault/
```

This is where your private files will live. Move anything you want hidden into this
`vault` folder.

---

## Part 2: Build the Shortcut

Open the **Shortcuts** app and tap **+** to create a new shortcut.

### Step 2 — Add the Decoy Notification (Layer 1)

This makes the shortcut look like a real utility when someone watches you open it.

1. Tap **Add Action**.
2. Search for **Show Notification** and add it.
3. Configure:
   - **Title:** `Battery Health`
   - **Body:** `Scanning system diagnostics...`
   - **Play Sound:** Off
4. Below that, add a **Wait** action:
   - Set it to **2** seconds.
5. Add another **Show Notification**:
   - **Title:** `Battery Health`
   - **Body:** `Analyzing thermal data...`
6. Add another **Wait** action:
   - Set it to **1** second.

> This 3-second fake "scanning" animation sells the disguise.

---

### Step 3 — Add Biometric Authentication (Layer 2)

This is the first real security gate using Face ID or Touch ID.

1. Add a **Set Variable** action:
   - Variable Name: `authPassed`
   - Value: `No`
2. Add an **Open App** action, but instead search for and add the action called
   **Lock Screen**. Alternatively (and more reliably):

   **Method A — Use "Request Authentication":**
   1. Search for **If** and add it.
   2. Before the If block, add **Get Device Details** → select **Device Name**.
   3. Now here is the key trick: search for and add the scripting action
      **Request Payment** — then cancel out of it. Instead, do this:

   **Method B (Recommended) — Use a Personal Automation as the auth trigger:**
   1. Actually, the most reliable biometric lock in Shortcuts is to use the
      **"Ask for Input"** action combined with checking a secret value. But first,
      let's use the built-in device auth:

   **Correct Method — Lock the Shortcut Itself:**
   1. Before we continue building actions, tap the **shortcut name** at the top.
   2. Tap **Details** (or the info ⓘ icon).
   3. Scroll down and look for the **Privacy** section.
   4. Enable **"Require Authentication Before Running"** if available on your iOS
      version (iOS 17.2+). This forces Face ID/Touch ID/passcode before ANY action
      runs.

   If your iOS version doesn't have that toggle, we handle it in the PIN step below.

---

### Step 4 — Add the Secret PIN Gate (Layer 3)

This is a second factor — even if someone gets past biometrics (e.g., while you're
sleeping and they use your face), they still need a PIN.

1. Add an **Ask for Input** action:
   - **Prompt:** `Enter diagnostic code to continue`
   - **Input Type:** Number
   - This keeps up the disguise — it looks like a system diagnostic prompt.
2. Add an **If** action right after:
   - Condition: **Provided Input** `is` `YOUR_SECRET_PIN`
   - Replace `YOUR_SECRET_PIN` with your chosen number (e.g., `8421`).

#### Inside the "If" (PIN was correct):

3. Add a **Show Notification** action:
   - **Title:** `Diagnostics`
   - **Body:** `Accessing thermal log archive...`
4. Add a **Wait** action: **1** second.
5. Now add the crucial action — **Open File**:
   - Search for and add the **Open File** or **Get File** action.
   - For the file path, navigate to and select your hidden folder:
     ```
     .system_cache/thermal_data/logs_2024/vault/
     ```
   - Alternatively, use the **Open URLs** action with the Files app path. Add
     **URL** action and enter:
     ```
     shareddocuments:///private/var/mobile/Library/Mobile%20Documents/com~apple~CloudDocs/.system_cache/thermal_data/logs_2024/vault/
     ```
     Then add **Open URLs** to open it.

   **Simplest reliable method:**
   - Add a **Save File** action (this forces the Files picker to open to a location).
   - OR use **Open App** set to **Files**, then follow it with a **Wait** (1s), then
     a second **Open URLs** action with the `shareddocuments://` URL above.

#### Inside the "Otherwise" (wrong PIN):

6. In the **Otherwise** section of the If block:
   - Add **Show Notification**:
     - **Title:** `Battery Health`
     - **Body:** `Battery condition: Good (94% capacity). No issues detected.`
   - Add **Stop This Shortcut** (found under Scripting).
   - This gracefully exits with a totally believable fake result. Nobody suspects
     a thing.

7. Close the **End If**.

---

### Step 5 — Add a Failed Attempt Counter (Advanced Layer)

This optional step locks out the shortcut after 3 wrong PIN attempts.

1. Before the Ask for Input, add **Get File** to read a counter file:
   - Path: `.system_cache/thermal_data/attempt_count.txt`
2. Add an **If** to check if the file contents are `≥ 3`:
   - If yes: show "Diagnostics unavailable. Try again later." → **Stop Shortcut**.
   - If no: continue to the PIN prompt.
3. After a **wrong PIN** (in the Otherwise block), add actions to:
   - Read the current count from the file.
   - Add 1 to it using **Calculate** (current count + 1).
   - **Save File** to overwrite `attempt_count.txt` with the new count.
4. After a **correct PIN**, save `0` back to `attempt_count.txt` to reset it.

---

### Step 6 — Add a Timestamped Access Log (Advanced Layer)

Track when and how the vault was accessed.

1. After the correct PIN branch (before opening the folder), add:
   - **Date** action → set to **Current Date**.
   - **Format Date** → format: `yyyy-MM-dd HH:mm:ss`
   - **Get File**: `.system_cache/thermal_data/access_log.txt`
   - **Text** action: combine the existing log + newline + formatted date + ` ACCESS_GRANTED`
   - **Save File**: overwrite `access_log.txt` with the combined text.

2. In the failed PIN branch, do the same but log ` ACCESS_DENIED`.

Your log file will look like:
```
2026-03-13 14:22:07 ACCESS_GRANTED
2026-03-13 15:01:44 ACCESS_DENIED
2026-03-13 15:01:51 ACCESS_DENIED
2026-03-13 18:45:33 ACCESS_GRANTED
```

---

## Part 3: Disguise the Shortcut

### Step 7 — Set a Convincing Name and Icon

1. Tap the shortcut name at the top of the editor.
2. Tap **Rename** and set it to:
   ```
   Battery Health Check
   ```
   Other good disguise names:
   - `Wi-Fi Diagnostics`
   - `Storage Cleaner`
   - `System Info`
   - `Compass Calibration`
3. Tap the **icon** next to the name.
4. Choose:
   - **Glyph:** Battery icon (or wrench, gear, etc.)
   - **Color:** Green (to match system utility vibes)

### Step 8 — Add It to the Home Screen

1. Tap the dropdown arrow (or ⓘ) on the shortcut name.
2. Tap **Add to Home Screen**.
3. You can customize the home screen icon separately here — consider using:
   - A plain green battery icon
   - Or even a custom image that looks like a stock iOS app
4. Tap **Add**.

### Step 9 — Bury It in Plain Sight

Move the shortcut icon into a folder on your home screen alongside other utility
apps (Settings, Compass, Measure, etc.) so it blends in perfectly.

---

## Part 4: The Complete Action Sequence

Here's the full shortcut action list in order for reference:

```
 1. Show Notification    → "Scanning system diagnostics..."
 2. Wait                 → 2 seconds
 3. Show Notification    → "Analyzing thermal data..."
 4. Wait                 → 1 second
 5. Get File             → attempt_count.txt
 6. If                   → count ≥ 3
 7.   Show Notification  → "Diagnostics unavailable."
 8.   Stop Shortcut
 9. End If
10. Ask for Input        → "Enter diagnostic code" (Number)
11. If                   → input = YOUR_PIN
12.   Text               → "0"
13.   Save File          → attempt_count.txt (overwrite)
14.   Date               → Current Date
15.   Format Date        → yyyy-MM-dd HH:mm:ss
16.   Get File           → access_log.txt
17.   Text               → [old log] + \n + [date] + " ACCESS_GRANTED"
18.   Save File          → access_log.txt (overwrite)
19.   Show Notification  → "Accessing thermal log archive..."
20.   Wait               → 1 second
21.   URL                → shareddocuments:///...path.../vault/
22.   Open URLs
23. Otherwise            → (wrong PIN)
24.   Get File           → attempt_count.txt
25.   Calculate          → count + 1
26.   Save File          → attempt_count.txt (overwrite)
27.   Date               → Current Date
28.   Format Date        → yyyy-MM-dd HH:mm:ss
29.   Get File           → access_log.txt
30.   Text               → [old log] + \n + [date] + " ACCESS_DENIED"
31.   Save File          → access_log.txt (overwrite)
32.   Show Notification  → "Battery: Good (94%). No issues."
33.   Stop Shortcut
34. End If
```

---

## Tips and Warnings

- **Backup your vault contents.** If you use "On My iPhone" storage, the files are
  NOT backed up to iCloud and will be lost if you reset your phone.
- **Remember your PIN.** There is no recovery mechanism. If you forget it, you'll
  need to manually navigate to the folder in Files to access your stuff.
- **iOS updates may change behavior.** The `shareddocuments://` URL scheme and
  Shortcuts actions can change between iOS versions. Test after major updates.
- **This is security through obscurity.** It will stop casual snooping effectively,
  but it is not encryption. For truly sensitive data, use an app with AES-256
  encryption (like a password manager or encrypted notes app).
- **To reset the lockout counter**, manually navigate to
  `.system_cache/thermal_data/attempt_count.txt` in Files and delete it or change
  its contents to `0`.
