import { FileStructure } from "@/types";
import { javascript } from '@codemirror/lang-javascript';
import { Group, Tree, TreeNodeData } from '@mantine/core';
import { invoke } from "@tauri-apps/api/tauri";
import CodeMirror from '@uiw/react-codemirror';
import { ChevronDown, File } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Landing() {
  const params = useSearchParams();
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dirPath = params.get("path");
  const [editorData, setEditorData] = useState<string>("");

  useEffect(() => {
    if (!dirPath) return;

    const fetchFileStructure = async () => {
      try {
        const files: FileStructure = await invoke("get_file_structure", { path: dirPath });
        const processedData = recurse_node(files);
        setTreeData([processedData]);
      } catch (err) {
        console.error("An error occurred while fetching the file structure:", err);
        setError("Failed to load file structure.");
      } finally {
        setLoading(false);
      }
    };

    fetchFileStructure();
  }, [dirPath]);

  const recurse_node = (file: FileStructure) => {
    const fileData: TreeNodeData = {
      label: file.name,
      value: file.full_path,
    };
    if (file.children) {
      fileData.children = file.children.map(recurse_node);
    }
    return fileData;
  };

  const handleFileOpen = (file_path: string) => {
    invoke<string>("read_file", { path: file_path }).then((data: string) => {
      console.log(data)
      setEditorData(data);
    })
  };

  return (
    <div className="flex flex-row h-screen">
      <div className="flex w-1/5 bg-transparent flex-col pl-2 pt-1 pr-2">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <Tree
            data={treeData}
            levelOffset={20}
            renderNode={({ node, expanded, hasChildren, elementProps }) => (
              <Group gap={5} {...elementProps}>
                {hasChildren && (
                  <ChevronDown
                    size={18}
                    style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                  />
                )}
                <div
                  className="text-sm whitespace-nowrap overflow-ellipsis overflow-hidden"
                  onClick={() => !node.children && handleFileOpen(node.value)}
                >
                  {!node.children && <File className="translate-y-1 pr-1 mb-[0.4]" size={18} />}
                  <span>{node.label}</span>
                </div>
              </Group>
            )}
          />
        )}
      </div>
      <div className="w-4/5 h-screen flex flex-col">
        {/* <Editor
          className="mb-0"
          defaultLanguage="test"
          defaultValue=""
          value={editorData}
          theme="vs-dark"
          options={{ readOnly: true }}

        /> */}
        <CodeMirror value={editorData} extensions={[javascript()]} />
        <div className="h-1/5 mb-0 mt-0 bg-[#121212]">
          <h1 className="text-center">D1 YAPPING</h1>
        </div>
      </div>
    </div>
  );
}
