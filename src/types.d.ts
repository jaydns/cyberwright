export interface FileStructure {
  name: string;
  file_type: "File" | "Directory";
  full_path: string;
  children: FileStructure[] | null;
}


interface AiIssue {
  lineNumber: number;
  severity: "warning" | "critical";
  synopsis: string;
}

interface AiFormat {
  issues: AiIssue[];
}
export interface dialog {
  content: string,
  id: number,
  severity: string,
}

export interface recent_open {
  folder_path: string,
  fodler_name: string
}