use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::fs;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use uuid::Uuid;
use tauri::{Manager, Emitter};
use tauri_plugin_fs::FsExt;
use std::sync::Mutex;
use once_cell::sync::Lazy;

// Recent projects storage
static RECENT_PROJECTS: Lazy<Mutex<Vec<String>>> = Lazy::new(|| Mutex::new(Vec::new()));
static CURRENT_PROJECT: Lazy<Mutex<Option<String>>> = Lazy::new(|| Mutex::new(None));

// Attachment file storage
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AttachmentInfo {
    pub id: String,
    pub name: String,
    pub mime_type: String,
    pub size: u64,
    pub path: String,
    pub created_at: u64,
    pub data: String,  // Base64 data URI for preview
}

#[derive(Debug, Deserialize)]
pub struct SaveAttachmentRequest {
    pub name: String,
    pub r#type: String,
    pub data: String,
}

#[tauri::command]
fn save_attachment(app: tauri::AppHandle, request: SaveAttachmentRequest) -> Result<AttachmentInfo, String> {
    let attachment_id = Uuid::new_v4().to_string();
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let attachments_dir = app_data_dir.join("attachments");
    fs::create_dir_all(&attachments_dir)
        .map_err(|e| format!("Failed to create attachments dir: {}", e))?;

    let base64_data = if request.data.starts_with("data:") {
        request.data.split(',').nth(1).unwrap_or(&request.data)
    } else {
        &request.data
    };

    let file_bytes = BASE64.decode(base64_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let file_path = attachments_dir.join(format!("{}_{}", attachment_id, request.name));
    fs::write(&file_path, &file_bytes)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    // Create data URI for preview
    let data_uri = format!("data:{};base64,{}", request.r#type, base64_data);

    Ok(AttachmentInfo {
        id: attachment_id,
        name: request.name.clone(),
        mime_type: request.r#type.clone(),
        size: file_bytes.len() as u64,
        path: file_path.to_string_lossy().to_string(),
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| e.to_string())?
            .as_secs(),
        data: data_uri,
    })
}

#[tauri::command]
fn get_attachment(app: tauri::AppHandle, id: String) -> Result<String, String> {
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let attachments_dir = app_data_dir.join("attachments");
    let mut found_path: Option<PathBuf> = None;
    
    if let Ok(entries) = fs::read_dir(&attachments_dir) {
        for entry in entries.flatten() {
            let file_name = entry.file_name().to_string_lossy().to_string();
            if file_name.starts_with(&format!("{}_", id)) {
                found_path = Some(entry.path());
                break;
            }
        }
    }

    let file_path = found_path.ok_or_else(|| format!("Attachment not found: {}", id))?;
    let file_bytes = fs::read(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    let base64_data = BASE64.encode(&file_bytes);
    let mime_type = guess_mime_type(&file_path);

    Ok(format!("data:{};base64,{}", mime_type, base64_data))
}

#[tauri::command]
fn delete_attachment(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let attachments_dir = app_data_dir.join("attachments");
    
    if let Ok(entries) = fs::read_dir(&attachments_dir) {
        for entry in entries.flatten() {
            let file_name = entry.file_name().to_string_lossy().to_string();
            if file_name.starts_with(&format!("{}_", id)) {
                fs::remove_file(entry.path())
                    .map_err(|e| format!("Failed to delete file: {}", e))?;
                return Ok(());
            }
        }
    }

    Err(format!("Attachment not found: {}", id))
}

#[tauri::command]
fn upload_file(app: tauri::AppHandle, request: SaveAttachmentRequest) -> Result<AttachmentInfo, String> {
    let file_id = Uuid::new_v4().to_string();
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let uploads_dir = app_data_dir.join("uploads");
    fs::create_dir_all(&uploads_dir)
        .map_err(|e| format!("Failed to create uploads dir: {}", e))?;

    let base64_data = if request.data.starts_with("data:") {
        request.data.split(',').nth(1).unwrap_or(&request.data)
    } else {
        &request.data
    };

    let file_bytes = BASE64.decode(base64_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let file_path = uploads_dir.join(format!("{}_{}", file_id, request.name));
    fs::write(&file_path, &file_bytes)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    // Create data URI for preview
    let data_uri = format!("data:{};base64,{}", request.r#type, base64_data);

    Ok(AttachmentInfo {
        id: file_id,
        name: request.name.clone(),
        mime_type: request.r#type.clone(),
        size: file_bytes.len() as u64,
        path: file_path.to_string_lossy().to_string(),
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| e.to_string())?
            .as_secs(),
        data: data_uri,
    })
}

#[tauri::command]
fn get_uploads(app: tauri::AppHandle) -> Result<Vec<AttachmentInfo>, String> {
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let uploads_dir = app_data_dir.join("uploads");
    let mut uploads = Vec::new();

    if let Ok(entries) = fs::read_dir(&uploads_dir) {
        for entry in entries.flatten() {
            let metadata = fs::metadata(entry.path())
                .map_err(|e| format!("Failed to get metadata: {}", e))?;

            let file_name = entry.file_name().to_string_lossy().to_string();
            let parts: Vec<&str> = file_name.splitn(2, '_').collect();
            let file_id = parts.get(0).unwrap_or(&"unknown").to_string();
            let original_name = parts.get(1).unwrap_or(&"unknown").to_string();
            
            // Read file content for preview
            let file_bytes = fs::read(&entry.path())
                .map_err(|e| format!("Failed to read file: {}", e))?;
            let base64_data = BASE64.encode(&file_bytes);
            let mime_type = guess_mime_type(&entry.path());
            let data_uri = format!("data:{};base64,{}", mime_type, base64_data);

            uploads.push(AttachmentInfo {
                id: file_id,
                name: original_name,
                mime_type: mime_type.clone(),
                size: metadata.len(),
                path: entry.path().to_string_lossy().to_string(),
                created_at: metadata.modified()
                    .map_err(|e| format!("Failed to get modified time: {}", e))?
                    .duration_since(std::time::UNIX_EPOCH)
                    .map_err(|e| e.to_string())?
                    .as_secs(),
                data: data_uri,
            });
        }
    }

    Ok(uploads)
}

#[tauri::command]
fn delete_upload(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let uploads_dir = app_data_dir.join("uploads");
    
    if let Ok(entries) = fs::read_dir(&uploads_dir) {
        for entry in entries.flatten() {
            let file_name = entry.file_name().to_string_lossy().to_string();
            if file_name.starts_with(&format!("{}_", id)) {
                fs::remove_file(entry.path())
                    .map_err(|e| format!("Failed to delete file: {}", e))?;
                return Ok(());
            }
        }
    }
    
    Err(format!("Upload not found: {}", id))
}

fn guess_mime_type(path: &PathBuf) -> String {
    let extension = path.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match extension.as_str() {
        "pdf" => "application/pdf".to_string(),
        "jpg" | "jpeg" => "image/jpeg".to_string(),
        "png" => "image/png".to_string(),
        "gif" => "image/gif".to_string(),
        "webp" => "image/webp".to_string(),
        "svg" => "image/svg+xml".to_string(),
        "mp3" | "wav" | "ogg" => "audio/mpeg".to_string(),
        "mp4" | "webm" | "avi" => "video/mp4".to_string(),
        "txt" => "text/plain".to_string(),
        "md" => "text/markdown".to_string(),
        "html" | "htm" => "text/html".to_string(),
        "json" => "application/json".to_string(),
        "doc" | "docx" => "application/msword".to_string(),
        "xls" | "xlsx" => "application/vnd.ms-excel".to_string(),
        _ => "application/octet-stream".to_string(),
    }
}

// Project file structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectFile {
    pub name: String,
    pub version: String,
    pub created_at: u64,
    pub updated_at: u64,
    pub data: serde_json::Value,
}

#[tauri::command]
fn open_project(app: tauri::AppHandle, path: String) -> Result<String, String> {
    // Read project file to validate it
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read project file: {}", e))?;

    let _project: ProjectFile = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse project file: {}", e))?;
    
    // Add to recent projects
    {
        let mut recent = RECENT_PROJECTS.lock().unwrap();
        if !recent.contains(&path) {
            recent.insert(0, path.clone());
            if recent.len() > 10 {
                recent.truncate(10);
            }
        }

        // Update current project
        let mut current = CURRENT_PROJECT.lock().unwrap();
        *current = Some(path.clone());

        // Emit event to frontend
        let _ = app.emit("project-opened", &path);
        let _ = app.emit("recent-projects-updated", recent.clone());
    }

    Ok(path)
}

#[tauri::command]
fn save_project(app: tauri::AppHandle, path: String, data: serde_json::Value) -> Result<String, String> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();
    
    let project = ProjectFile {
        name: path.split('/').last().unwrap_or("project").replace(".json.cms", ""),
        version: "1.0.0".to_string(),
        created_at: now,
        updated_at: now,
        data,
    };
    
    let content = serde_json::to_string_pretty(&project)
        .map_err(|e| format!("Failed to serialize project: {}", e))?;
    
    fs::write(&path, &content)
        .map_err(|e| format!("Failed to write project file: {}", e))?;
    
    // Update current project
    {
        let mut current = CURRENT_PROJECT.lock().unwrap();
        *current = Some(path.clone());
        
        // Add to recent
        let mut recent = RECENT_PROJECTS.lock().unwrap();
        if !recent.contains(&path) {
            recent.insert(0, path.clone());
            if recent.len() > 10 {
                recent.truncate(10);
            }
        }
        
        let _ = app.emit("project-saved", &path);
        let _ = app.emit("recent-projects-updated", recent.clone());
    }
    
    Ok(path)
}

#[tauri::command]
fn close_project(app: tauri::AppHandle) -> Result<(), String> {
    {
        let mut current = CURRENT_PROJECT.lock().unwrap();
        *current = None;
    }
    
    let _ = app.emit("project-closed", ());
    Ok(())
}

#[tauri::command]
fn get_recent_projects() -> Result<Vec<String>, String> {
    let recent = RECENT_PROJECTS.lock().unwrap();
    Ok(recent.clone())
}

#[tauri::command]
fn clear_recent_projects(app: tauri::AppHandle) -> Result<(), String> {
    let mut recent = RECENT_PROJECTS.lock().unwrap();
    recent.clear();
    let _ = app.emit("recent-projects-updated", Vec::<String>::new());
    Ok(())
}

#[tauri::command]
fn get_current_project() -> Result<Option<String>, String> {
    let current = CURRENT_PROJECT.lock().unwrap();
    Ok(current.clone())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            save_attachment,
            get_attachment,
            delete_attachment,
            upload_file,
            get_uploads,
            delete_upload,
            open_project,
            save_project,
            close_project,
            get_recent_projects,
            clear_recent_projects
        ])
        .setup(|app| {
            let fs_scope = app.fs_scope();
            if let Ok(app_data_dir) = app.path().app_data_dir() {
                let _: Result<(), _> = fs_scope.allow_directory(&app_data_dir, true);
                if let Ok(download_dir) = app.path().download_dir() {
                    let _: Result<(), _> = fs_scope.allow_directory(&download_dir, true);
                }
            }

            // Create native menu with project management and reload (macOS only)
            #[cfg(target_os = "macos")]
            {
                use tauri::menu::{Submenu, MenuItem, PredefinedMenuItem};

                // Project menu items
                let open_project = MenuItem::with_id(app, "open_project", "Open Project…", true, Some("CmdOrCtrl+O"))?;
                let save_project = MenuItem::with_id(app, "save_project", "Save Project…", true, Some("CmdOrCtrl+S"))?;
                let close_project = MenuItem::with_id(app, "close_project", "Close Project", true, Some("CmdOrCtrl+W"))?;
                let recent_separator = PredefinedMenuItem::separator(app)?;
                let clear_recent = MenuItem::with_id(app, "clear_recent", "Clear Recent Projects", true, None::<&str>)?;

                // Project submenu
                let project_menu = Submenu::with_items(app, "Project", true, &[
                    &open_project,
                    &save_project,
                    &close_project,
                    &recent_separator,
                    &clear_recent,
                ])?;

                // View menu with zoom and reload
                let zoom_in = MenuItem::with_id(app, "zoom_in", "Zoom In", true, Some("CmdOrCtrl+Plus"))?;
                let zoom_out = MenuItem::with_id(app, "zoom_out", "Zoom Out", true, Some("CmdOrCtrl+-"))?;
                let zoom_reset = MenuItem::with_id(app, "zoom_reset", "Actual Size", true, Some("CmdOrCtrl+0"))?;
                let zoom_separator = PredefinedMenuItem::separator(app)?;
                let reload = MenuItem::with_id(app, "reload", "Reload", true, Some("CmdOrCtrl+R"))?;
                let force_reload = MenuItem::with_id(app, "force_reload", "Force Reload", true, Some("Cmd+Shift+R"))?;
                
                let view_menu = Submenu::with_items(app, "View", true, &[
                    &zoom_in,
                    &zoom_out,
                    &zoom_reset,
                    &zoom_separator,
                    &reload,
                    &force_reload,
                ])?;

                // Add to the menubar
                let menu = app.menu().ok_or("Failed to get menu")?;
                menu.append(&project_menu)?;
                menu.append(&view_menu)?;
            }

            Ok(())
        })
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "open_project" => {
                    let _ = app.emit("menu-open-project", ());
                }
                "save_project" => {
                    let _ = app.emit("menu-save-project", ());
                }
                "close_project" => {
                    let _ = app.emit("menu-close-project", ());
                }
                "clear_recent" => {
                    let mut recent = RECENT_PROJECTS.lock().unwrap();
                    recent.clear();
                    let _ = app.emit("recent-projects-updated", Vec::<String>::new());
                }
                "zoom_in" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval("document.body.style.zoom = (parseFloat(getComputedStyle(document.body).zoom || 1) + 0.1).toString()");
                    }
                }
                "zoom_out" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval("document.body.style.zoom = Math.max(0.5, parseFloat(getComputedStyle(document.body).zoom || 1) - 0.1).toString()");
                    }
                }
                "zoom_reset" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval("document.body.style.zoom = 1");
                    }
                }
                "reload" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval("window.location.reload()");
                    }
                }
                "force_reload" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval("window.location.reload(true)");
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    // Test attachment info serialization
    #[test]
    fn test_attachment_info_serialization() {
        let attachment = AttachmentInfo {
            id: "test-id".to_string(),
            name: "test.pdf".to_string(),
            mime_type: "application/pdf".to_string(),
            size: 1024,
            path: "/path/to/file".to_string(),
            created_at: 1234567890,
            data: "data:application/pdf;base64,test".to_string(),
        };

        let serialized = serde_json::to_string(&attachment).unwrap();
        assert!(serialized.contains("test-id"));
        assert!(serialized.contains("test.pdf"));
        assert!(serialized.contains("application/pdf"));
    }

    // Test attachment info deserialization
    #[test]
    fn test_attachment_info_deserialization() {
        let json = r#"{
            "id": "test-id",
            "name": "test.png",
            "mime_type": "image/png",
            "size": 2048,
            "path": "/path/to/image.png",
            "created_at": 1234567890,
            "data": "data:image/png;base64,test"
        }"#;

        let attachment: AttachmentInfo = serde_json::from_str(json).unwrap();
        assert_eq!(attachment.id, "test-id");
        assert_eq!(attachment.name, "test.png");
        assert_eq!(attachment.mime_type, "image/png");
        assert_eq!(attachment.size, 2048);
    }

    // Test project file serialization
    #[test]
    fn test_project_file_serialization() {
        let project = ProjectFile {
            name: "Test Project".to_string(),
            version: "1.0.0".to_string(),
            created_at: 1234567890,
            updated_at: 1234567890,
            data: json!({"pages": [], "settings": {}}),
        };

        let serialized = serde_json::to_string(&project).unwrap();
        assert!(serialized.contains("Test Project"));
        assert!(serialized.contains("1.0.0"));
        assert!(serialized.contains("pages"));
    }

    // Test project file deserialization
    #[test]
    fn test_project_file_deserialization() {
        let json = r#"{
            "name": "My Project",
            "version": "2.0.0",
            "created_at": 1234567890,
            "updated_at": 1234567891,
            "data": {
                "pages": [{"id": "1", "name": "Home"}],
                "settings": {"theme": "dark"}
            }
        }"#;

        let project: ProjectFile = serde_json::from_str(json).unwrap();
        assert_eq!(project.name, "My Project");
        assert_eq!(project.version, "2.0.0");
        assert_eq!(project.data["pages"][0]["name"], "Home");
    }

    // Test MIME type guessing
    #[test]
    fn test_guess_mime_type_pdf() {
        let path = PathBuf::from("/path/to/file.pdf");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "application/pdf");
    }

    #[test]
    fn test_guess_mime_type_jpg() {
        let path = PathBuf::from("/path/to/file.jpg");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "image/jpeg");
    }

    #[test]
    fn test_guess_mime_type_png() {
        let path = PathBuf::from("/path/to/file.png");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "image/png");
    }

    #[test]
    fn test_guess_mime_type_svg() {
        let path = PathBuf::from("/path/to/file.svg");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "image/svg+xml");
    }

    #[test]
    fn test_guess_mime_type_mp4() {
        let path = PathBuf::from("/path/to/file.mp4");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "video/mp4");
    }

    #[test]
    fn test_guess_mime_type_txt() {
        let path = PathBuf::from("/path/to/file.txt");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "text/plain");
    }

    #[test]
    fn test_guess_mime_type_json() {
        let path = PathBuf::from("/path/to/file.json");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "application/json");
    }

    #[test]
    fn test_guess_mime_type_unknown() {
        let path = PathBuf::from("/path/to/file.xyz");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "application/octet-stream");
    }

    #[test]
    fn test_guess_mime_type_no_extension() {
        let path = PathBuf::from("/path/to/file");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "application/octet-stream");
    }

    #[test]
    fn test_guess_mime_type_case_insensitive() {
        let path = PathBuf::from("/path/to/file.PNG");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "image/png");
    }

    // Test base64 encoding/decoding
    #[test]
    fn test_base64_encode_decode() {
        let original = b"Hello, World!";
        let encoded = BASE64.encode(original);
        let decoded = BASE64.decode(&encoded).unwrap();
        
        assert_eq!(decoded, original);
    }

    #[test]
    fn test_base64_empty_data() {
        let original = b"";
        let encoded = BASE64.encode(original);
        let decoded = BASE64.decode(&encoded).unwrap();
        
        assert_eq!(decoded, original);
    }

    // Test data URI parsing
    #[test]
    fn test_data_uri_split() {
        let data_uri = "data:image/png;base64,test";
        let base64_data = if data_uri.starts_with("data:") {
            data_uri.split(',').nth(1).unwrap_or(&data_uri)
        } else {
            &data_uri
        };
        
        assert!(!base64_data.starts_with("data:"));
        assert_eq!(base64_data, "test");
    }

    #[test]
    fn test_plain_base64_no_split() {
        let base64_data = "dGVzdA==";
        let result = if base64_data.starts_with("data:") {
            base64_data.split(',').nth(1).unwrap_or(&base64_data)
        } else {
            &base64_data
        };
        
        assert_eq!(result, base64_data);
    }

    // Test recent projects list management
    #[test]
    fn test_recent_projects_limit() {
        let mut recent = Vec::new();
        
        // Add 15 projects (limit is 10)
        for i in 0..15 {
            let path = format!("/path/to/project{}.json.cms", i);
            if !recent.contains(&path) {
                recent.insert(0, path.clone());
                if recent.len() > 10 {
                    recent.truncate(10);
                }
            }
        }
        
        assert_eq!(recent.len(), 10);
        assert_eq!(recent[0], "/path/to/project14.json.cms");
        assert_eq!(recent[9], "/path/to/project5.json.cms");
    }

    #[test]
    fn test_recent_projects_no_duplicates() {
        let mut recent = Vec::new();
        let path = "/path/to/project.json.cms".to_string();
        
        // Add same project multiple times
        for _ in 0..5 {
            if !recent.contains(&path) {
                recent.insert(0, path.clone());
                if recent.len() > 10 {
                    recent.truncate(10);
                }
            }
        }
        
        assert_eq!(recent.len(), 1);
        assert_eq!(recent[0], path);
    }

    // Test save attachment request
    #[test]
    fn test_save_attachment_request_deserialization() {
        let json = r#"{
            "name": "test.pdf",
            "type": "application/pdf",
            "data": "data:application/pdf;base64,test"
        }"#;

        let request: SaveAttachmentRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.name, "test.pdf");
        assert_eq!(request.r#type, "application/pdf");
        assert!(request.data.starts_with("data:"));
    }

    // Test file path handling
    #[test]
    fn test_file_path_with_spaces() {
        let path = PathBuf::from("/path/to/my file.pdf");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "application/pdf");
    }

    #[test]
    fn test_file_path_unicode() {
        let path = PathBuf::from("/path/to/文件.pdf");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "application/pdf");
    }

    // Test UUID generation
    #[test]
    fn test_uuid_format() {
        let id = Uuid::new_v4().to_string();
        
        // UUID v4 should be 36 characters (8-4-4-4-12 format)
        assert_eq!(id.len(), 36);
        
        // Should have correct hyphen positions
        assert_eq!(id.chars().nth(8), Some('-'));
        assert_eq!(id.chars().nth(13), Some('-'));
        assert_eq!(id.chars().nth(18), Some('-'));
        assert_eq!(id.chars().nth(23), Some('-'));
    }

    #[test]
    fn test_uuid_uniqueness() {
        let id1 = Uuid::new_v4().to_string();
        let id2 = Uuid::new_v4().to_string();
        
        assert_ne!(id1, id2);
    }

    // Test JSON serialization edge cases
    #[test]
    fn test_json_special_characters() {
        let data = json!({
            "name": "Test \"Quotes\" & <Special> Chars",
            "unicode": "你好世界 🚀"
        });
        
        let serialized = serde_json::to_string(&data).unwrap();
        assert!(serialized.contains("Quotes"));
        
        let deserialized: serde_json::Value = serde_json::from_str(&serialized).unwrap();
        assert_eq!(deserialized["unicode"].as_str().unwrap(), "你好世界 🚀");
    }

    #[test]
    fn test_json_empty_object() {
        let data = json!({});
        let serialized = serde_json::to_string(&data).unwrap();
        assert_eq!(serialized, "{}");
    }

    #[test]
    fn test_json_null_values() {
        let data = json!({
            "value": null,
            "number": 42,
            "string": "test"
        });
        
        assert!(data["value"].is_null());
        assert!(data["number"].is_number());
        assert!(data["string"].is_string());
    }
}
