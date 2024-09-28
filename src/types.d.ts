interface FileStructure {
  name: string;
  file_type: "File" | "Directory";
  children: FileStructure[] | null;
}
