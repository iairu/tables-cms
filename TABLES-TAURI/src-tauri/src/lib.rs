use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::fs;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use uuid::Uuid;
use tauri::{Manager, Emitter};
use tauri_plugin_fs::FsExt;

// Attachment file storage
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AttachmentInfo {
    pub id: String,
    pub name: String,
    pub mime_type: String,
    pub size: u64,
    pub path: String,
    pub created_at: u64,
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
            
            uploads.push(AttachmentInfo {
                id: file_id,
                name: original_name,
                mime_type: guess_mime_type(&entry.path()),
                size: metadata.len(),
                path: entry.path().to_string_lossy().to_string(),
                created_at: metadata.modified()
                    .map_err(|e| format!("Failed to get modified time: {}", e))?
                    .duration_since(std::time::UNIX_EPOCH)
                    .map_err(|e| e.to_string())?
                    .as_secs(),
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
            delete_upload
        ])
        .setup(|app| {
            let fs_scope = app.fs_scope();
            if let Ok(app_data_dir) = app.path().app_data_dir() {
                let _: Result<(), _> = fs_scope.allow_directory(&app_data_dir, true);
                if let Ok(download_dir) = app.path().download_dir() {
                    let _: Result<(), _> = fs_scope.allow_directory(&download_dir, true);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
