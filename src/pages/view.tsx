import { leetLinter } from "@/1337source";
import { FileStructure } from "@/types";
import { javascript } from '@codemirror/lang-javascript';
import { linter, lintGutter } from '@codemirror/lint';
import { Button, Group, ScrollArea, Tabs, Tree, TreeNodeData } from '@mantine/core';
import { invoke } from "@tauri-apps/api/core";
import { atomone } from '@uiw/codemirror-theme-atomone';
import CodeMirror from '@uiw/react-codemirror';
import { ChevronDown, File, X } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TabStruct {
  file_name: string,
  file_content: string,
}

export default function Landing() {
  const params = useSearchParams();
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dirPath = params.get("path");
  const [editorData, setEditorData] = useState<string>("");
  const [tabs, setTabs] = useState<TabStruct[]>([]);
  const [activeTab, setActiveTab] = useState("");

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

  const handleFileOpen = (file_path: string, file_name: any) => {
    if (tabs.find((tab) => tab.file_name == file_name)) {
      setActiveTab(file_name);
      return;
    }
    invoke<string>("read_file", { path: file_path }).then((data: string) => {
      const newTab: TabStruct = { file_name: file_name, file_content: data }
      let newTabs = [newTab, ...tabs];
      setTabs(newTabs);
      setEditorData(data);
    })
  };

  const handleTabChange = (file_name: any) => {
    let struct = tabs.find((tab) => tab.file_name == file_name);
    if (!struct) {
      return
    }
    setActiveTab(file_name);
    setEditorData(struct?.file_content || "");
  }

  const handleClose = (e: string) => {
    let i = 0
    if (tabs.length != 1) {
      while (tabs[i].file_name != e) {
        i++;
      }
    }
    tabs.splice(i, 1);
    setTabs(tabs);
    if (tabs.length > 0) {
      handleTabChange(tabs[0].file_name);
    } else {
      setEditorData("");
    }
  }

  return (
    <div className="flex flex-row h-screen">
      <div className="flex w-1/5 bg-transparent flex-col pl-2 pt-1 pr-2">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ScrollArea scrollbars="y" className="overflow-ellipsis overflow-hidden pb-2 pt-2">
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
                    className="text-sm whitespace-nowrap"
                    onClick={() => !node.children && handleFileOpen(node.value, node.label)}
                  >
                    {!node.children && <File className="translate-y-1 pr-1 mb-[0.4]" size={18} />}
                    <span>{node.label}</span>
                  </div>
                </Group>
              )}
            />
          </ScrollArea>
        )}
      </div>
      <div className="w-4/5 h-screen flex flex-col bg-[#272c35]">
        <ScrollArea.Autosize className="pb-3">
          <Tabs allowTabDeactivation value={activeTab} onChange={(val) => handleTabChange(val)} keepMounted={false}>
            <Tabs.List>
              {
                tabs.map((tab) => {
                  return (
                    <Tabs.Tab value={tab.file_name} className="pt-5 pb-5" key={tab.file_name}>
                      {tab.file_name}
                      <Button
                        onClick={() => handleClose(tab.file_name)}
                        variant="transparent"
                        className="w-fit h-fit"
                      >
                        <X width={15} />
                      </Button>
                    </Tabs.Tab>
                  )
                })
              }
            </Tabs.List>
          </Tabs>
        </ScrollArea.Autosize>
        <ScrollArea>
          <CodeMirror
            value={editorData}
            extensions={[javascript(), linter(leetLinter()), lintGutter()]}
            theme={atomone}
            readOnly
          />
        </ScrollArea>
        <div className="h-1/5 mb-0 mt-0 bg-[#121212] w-4/5 fixed bottom-0">
          <h1 className="text-center">D1 YAPPING</h1>
        </div>
      </div>
    </div>
  );
}
