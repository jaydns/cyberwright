use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::cmp::Ordering;
use std::fs;
use std::path::Path;
use tauri::Manager;
use tokio::runtime::Runtime;
use window_vibrancy::{apply_acrylic, apply_blur, apply_vibrancy, NSVisualEffectMaterial};

#[derive(Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
enum FileType {
    Directory,
    File,
}

#[derive(Serialize, Deserialize)]
struct FileNode {
    name: String,
    file_type: FileType,
    full_path: String,
    children: Option<Vec<FileNode>>,
}

impl Ord for FileNode {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.file_type.cmp(&other.file_type) {
            Ordering::Equal => self.name.cmp(&other.name),
            other => other,
        }
    }
}

impl PartialOrd for FileNode {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl PartialEq for FileNode {
    fn eq(&self, other: &Self) -> bool {
        self.file_type == other.file_type && self.name == other.name
    }
}

impl Eq for FileNode {}

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
        children.sort();
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

fn add_line_numbers(text: &str) -> String {
    text.lines()
        .enumerate()
        .map(|(i, line)| format!("{:4} {}", i + 1, line))
        .collect::<Vec<String>>()
        .join("\n")
}

#[tauri::command]
fn get_ai_response(content: String) -> Result<String, String> {
    let runtime = tokio::runtime::Runtime::new().map_err(|e| e.to_string())?;

    runtime.block_on(async {
        // hardcoded api key lets GOOOO
        let api_key = "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".to_string();
        // let api_key = "ollama".to_string();

        let client = reqwest::Client::new();

        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).map_err(|e| e.to_string())?,
        );

        let body = json!({
            "messages": [
                {
                    "role": "system",
                    "content": "You are an application that identifies vulnerabilities in code.\nIgnore vulnerabilities that cannot be exploited, or are negligible.\nLine numbers are included in your input.\n\nReturn JSON in the following format:\n\n{\n    \"issues\": [\n        { \"lineNumber\": 1, \"severity\": \"warning\" | \"critical\", \"synopsis: \"A short description of the vulnerability, including suggested remediation. Include the function signature or responsible code, in backticks, if applicable.\" }\n    ]\n}"
                },
                {
                    "role": "user",
                    "content": add_line_numbers(content.as_str())
                }
            ],
            "model": "llama-3.1-70b-versatile", // groq
            // "model": "llama3.1:70b", // ollama
            "temperature": 1,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": false,
            "response_format": {
                "type": "json_object"
            },
            "stop": null
        });

        let response = client
            .post("https://api.groq.com/openai/v1/chat/completions")
            // .post("http://localhost:11434/v1/chat/completions")
            .headers(headers)
            .json(&body)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !response.status().is_success() {
            return Err(format!("req failed: {}", response.status()));
        }

        let response_body: Value = response.json().await.map_err(|e| e.to_string())?;

        let content = response_body["choices"][0]["message"]["content"]
            .as_str()
            .ok_or("Failed to extract content from response")?
            .to_string();

        Ok(content)
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
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
        .invoke_handler(tauri::generate_handler![
            get_file_structure,
            read_file,
            get_ai_response
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
