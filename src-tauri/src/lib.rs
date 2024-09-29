use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::Manager;
use window_vibrancy::{apply_acrylic, apply_blur, apply_vibrancy, NSVisualEffectMaterial};

#[derive(Serialize, Deserialize)]
enum FileType {
    File,
    Directory,
}

#[derive(Serialize, Deserialize)]
struct FileNode {
    name: String,
    file_type: FileType,
    full_path: String,
    children: Option<Vec<FileNode>>,
}

fn build_file_structure(path: &Path) -> Result<FileNode, std::io::Error> {
    let metadata = fs::metadata(path)?;
    let name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into_owned();

    if metadata.is_dir() {
        let mut children = Vec::new();
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let child = build_file_structure(&entry.path())?;
            children.push(child);
        }
        Ok(FileNode {
            name,
            file_type: FileType::Directory,
            full_path: path.to_str().unwrap().to_string(),
            children: Some(children),
        })
    } else {
        Ok(FileNode {
            name,
            file_type: FileType::File,
            full_path: path.to_str().unwrap().to_string(),
            children: None,
        })
    }
}

#[tauri::command]
fn get_file_structure(path: String) -> Result<FileNode, String> {
    build_file_structure(Path::new(&path)).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::Sidebar, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_acrylic(&window, Some((18, 18, 18, 125)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_file_structure, read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
