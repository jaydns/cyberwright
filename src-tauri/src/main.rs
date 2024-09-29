// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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
            children: Some(children),
        })
    } else {
        Ok(FileNode {
            name,
            file_type: FileType::File,
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

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::Sidebar, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_acrylic(&window, Some((18, 18, 18, 125)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_file_structure, read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
