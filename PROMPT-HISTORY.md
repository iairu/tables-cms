take the TAURI-SVELTE-REWRITE todolist app as a starter boilerplate on how to recode the entirety of TABLES-OLD.app/Contents/Resources gatsby+react+electron "offline cms" project into a tauri+svelte project for better performance and smaller footprint, edit the files directly

make sure that all of the code works for vercel deployment, extension toggling and pages and blog extension, this is a complex task that requires planning, existing working code found in TAURI-OLD is react+electron, we need it in tauri+svelte combination TABLES-TAURI folder

fix the hmr bug so i can use tauri::dev

perfect, now add the ability to do full reload with keybind cmd+shift+r and a reload with cmd+r into the app (tauri menu)

do not show notes button in header if notes extension is not enabled, also make sure that the header position is fixed

completely remove div.window-controls 

---

perfect, confirmation for uploads delete button shows up but the upload gets deleted before its confirmed, same for delete button in pages and other places, make sure to always wait for user confirmation of any delete

pedigree sidemenu button opens settings instead

theme in settings does not get reflected for the whole application, make sure css includes the entire app

remove notes save button, make them auto-save

add button to open/close current project and opened/closed recent projects into tauri menu, use a json file for saving/opening with custom .json.cms extension

add component button should only show dropdown on button focus

save button for pages and blogs does not save, show a little saved ticker next to it

add the ability to assign page to page group

port over complete rental management from TABLES-OLD.app/Contents/Resources

movie tracker does not allow for editing of any added movie, nor removal

uploads preview button does not work

vercel api key is not editable in settings, same for all other settings input fields

add to .project-menu margin-top of 65px, remove padding-top from .main-content

instead of no project open show "untitled project" and add "save project" button

theme from theme settings is still not reflected site-wide please fix

---

dark themes leave some elements with blank or white background, please fix

typing into input fields in settings does not actually type anything

blog article needs to be opened and then edit hit in current implementation, it would be better if it directly went to edit screen

make the create article button same size as the edit article button

pedigree button still incorrectly sends me to settings

have the notes extension be always visible, not overlaying elements but to the right of them, so that the blog/page/... author can work with it faster

remove the popup button from uploads, preview button fails to load the image as it is apparently not getting properly uploaded (metadata shows up correctly)

clicking save project does not open a save dialog please fix

open project opens a dropdown with a button of same name, consolidate it so i only need to click the original button to open a project

when "build locally" or "build & deploy" button is pressed show a console overlay with a progress bar and cancel button

main element has a bit of scroll (precisely the height of project menu), fix it so no scroll is needed

---

make the size of "create article" button the same as other buttons, currently the icon in it is huge, same for "create page"

make opening a page go directly to edit page, just like opening an article

make sure pages and page groups show up only if their extensions are enabled

by default disable all extensions

add back preview button to uploads and remove the other button, keep only preview and delete button for any given upload

add preview button to edit page, make sure it properly previews the page in an iframe with the actual theme that will be bundled with the page

---

filename on saving has .json.json.cms should only be .json.cms

opening a project does not show the filename in project menu bar, saving a project does

---

remove save button from page as it autosaves, same for blog

notes header overlays "open project" and "save project" buttons, fix

some elements like blockquote have incorrect (white) background in dark themes, active buttons should have black text in dark themes

make the settings sidebar styled just like sidemenu

make the whole app more compact: reduce all padding

add zoom keybinds to tauri

readd deploy button back to header as it is missing with a present vercel api key, show it only if vercel key is present

---

create unit tests for every feature in TABLES-TAURI, identify and implement missing features from TABLES-OLD.app/Contents/Resources project to TABLES-TAURI project

work on making the TABLES-TAURI project more robust, introduce auto-save always on as long as project has been saved manually at least once, improve css themes especially border colors in all themes, implement all missing features from TABLES-OLD

continue with remaining features

make the blog and pages view look like a single table with filtering options, make css more compact overall

continue with remaining features, add missing tests

---

work on making the TABLES-TAURI project more robust, add any missing features from TABLES-OLD to TABLES-TAURI, add missing tests

---

work on making the TABLES-TAURI project more robust, add any missing features from TABLES-OLD to TABLES-TAURI, add missing tests

---

add any missing features from TABLES-OLD to TABLES-TAURI

continue

---

add any missing details and full vercel deployment integration from TABLES-OLD to TABLES-TAURI

make sure vercel deployment integration is fully working
