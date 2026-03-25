take the TAURI-SVELTE-REWRITE todolist app as a starter boilerplate on how to recode the entirety of TABLES-OLD.app/Contents/Resources gatsby+react+electron "offline cms" project into a tauri+svelte project for better performance and smaller footprint, edit the files directly

make sure that all of the code works for vercel deployment, extension toggling and pages and blog extension, this is a complex task that requires planning, existing working code found in TAURI-OLD is react+electron, we need it in tauri+svelte combination TABLES-TAURI folder

fix the hmr bug so i can use tauri::dev

perfect, now add the ability to do full reload with keybind cmd+shift+r and a reload with cmd+r into the app (tauri menu)

do not show notes button in header if notes extension is not enabled, also make sure that the header position is fixed

completely remove div.window-controls 
