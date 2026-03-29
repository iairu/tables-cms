// Unit tests for TABLES CMS Tauri backend
// Run with: cargo test

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::fs;
    use std::path::PathBuf;
    use tempfile::TempDir;

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
    fn test_guess_mime_type_jpeg() {
        let path = PathBuf::from("/path/to/file.jpeg");
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
    fn test_guess_mime_type_gif() {
        let path = PathBuf::from("/path/to/file.gif");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "image/gif");
    }

    #[test]
    fn test_guess_mime_type_webp() {
        let path = PathBuf::from("/path/to/file.webp");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "image/webp");
    }

    #[test]
    fn test_guess_mime_type_svg() {
        let path = PathBuf::from("/path/to/file.svg");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "image/svg+xml");
    }

    #[test]
    fn test_guess_mime_type_mp3() {
        let path = PathBuf::from("/path/to/file.mp3");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "audio/mpeg");
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
    fn test_guess_mime_type_md() {
        let path = PathBuf::from("/path/to/file.md");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "text/markdown");
    }

    #[test]
    fn test_guess_mime_type_html() {
        let path = PathBuf::from("/path/to/file.html");
        let mime_type = guess_mime_type(&path);
        assert_eq!(mime_type, "text/html");
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

    #[test]
    fn test_base64_large_data() {
        let original = vec![42u8; 10000];
        let encoded = BASE64.encode(&original);
        let decoded = BASE64.decode(&encoded).unwrap();
        
        assert_eq!(decoded, original);
    }

    // Test data URI parsing
    #[test]
    fn test_data_uri_split() {
        let data_uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        let base64_data = if data_uri.starts_with("data:") {
            data_uri.split(',').nth(1).unwrap_or(&data_uri)
        } else {
            &data_uri
        };
        
        assert!(!base64_data.starts_with("data:"));
        assert_eq!(base64_data, "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
    }

    #[test]
    fn test_plain_base64_no_split() {
        let base64_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
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

    #[test]
    fn test_recent_projects_move_to_front() {
        let mut recent = vec![
            "/path/to/project1.json.cms".to_string(),
            "/path/to/project2.json.cms".to_string(),
            "/path/to/project3.json.cms".to_string(),
        ];
        
        // Re-add project2
        let path = "/path/to/project2.json.cms".to_string();
        if let Some(pos) = recent.iter().position(|p| p == &path) {
            recent.remove(pos);
        }
        recent.insert(0, path.clone());
        
        assert_eq!(recent[0], "/path/to/project2.json.cms");
        assert_eq!(recent.len(), 3);
    }

    // Test current project management
    #[test]
    fn test_current_project_set_get() {
        let mut current: Option<String> = None;
        let path = "/path/to/project.json.cms".to_string();
        
        current = Some(path.clone());
        assert_eq!(current, Some(path));
    }

    #[test]
    fn test_current_project_clear() {
        let mut current: Option<String> = Some("/path/to/project.json.cms".to_string());
        
        current = None;
        assert_eq!(current, None);
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

    // Test timestamp generation
    #[test]
    fn test_timestamp_generation() {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        assert!(now > 0);
        assert!(now < 2000000000); // Reasonable upper bound
    }

    // Test UUID generation (if uuid crate is used)
    #[test]
    fn test_uuid_format() {
        use uuid::Uuid;
        
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
        use uuid::Uuid;
        
        let id1 = Uuid::new_v4().to_string();
        let id2 = Uuid::new_v4().to_string();
        
        assert_ne!(id1, id2);
    }

    // Test JSON serialization edge cases
    #[test]
    fn test_json_special_characters() {
        let data = json!({
            "name": "Test \"Quotes\" & <Special> Chars",
            "path": "C:\\Users\\Test\\File.pdf",
            "unicode": "你好世界 🚀"
        });
        
        let serialized = serde_json::to_string(&data).unwrap();
        assert!(serialized.contains("Quotes"));
        assert!(serialized.contains("Special"));
        
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
    fn test_json_empty_array() {
        let data = json!([]);
        let serialized = serde_json::to_string(&data).unwrap();
        assert_eq!(serialized, "[]");
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

// Integration tests (require Tauri app handle)
#[cfg(test)]
mod integration_tests {
    use super::*;
    use tauri::test::{mock_builder, mock_context};

    // These tests would require a full Tauri environment
    // They are marked as ignored by default
    
    #[test]
    #[ignore]
    fn test_save_attachment_integration() {
        // This would test the actual save_attachment command
        // Requires mocking the Tauri app handle and file system
        todo!("Implement integration test with mocked Tauri environment");
    }

    #[test]
    #[ignore]
    fn test_upload_file_integration() {
        // This would test the actual upload_file command
        todo!("Implement integration test with mocked Tauri environment");
    }

    #[test]
    #[ignore]
    fn test_open_project_integration() {
        // This would test the actual open_project command
        todo!("Implement integration test with mocked Tauri environment");
    }

    #[test]
    #[ignore]
    fn test_save_project_integration() {
        // This would test the actual save_project command
        todo!("Implement integration test with mocked Tauri environment");
    }
}
