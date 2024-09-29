export interface FileStructure {
  name: string;
  file_type: "File" | "Directory";
  full_path: string;
  children: FileStructure[] | null;
}

export interface dialog {
  content: string,
  id: number
}