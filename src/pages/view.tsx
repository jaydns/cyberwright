import AiDialog from "@/components/aiDialog";
import { dialog, FileStructure } from "@/types";
import { transformDiagnostics } from "@/utils";
import { javascript } from '@codemirror/lang-javascript';
import { Diagnostic, linter, lintGutter } from '@codemirror/lint';
import { Alert, Anchor, Badge, Breadcrumbs, Button, Collapse, Group, Loader, Progress, ScrollArea, Tabs, Tree, TreeNodeData } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { invoke } from "@tauri-apps/api/core";
import { atomone } from '@uiw/codemirror-theme-atomone';
import CodeMirror from '@uiw/react-codemirror';
import { ChevronDown, File, Plus, X, ChevronLeft } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BiLogoTypescript } from "react-icons/bi";
import { FaCss3Alt, FaFileImage, FaHtml5, FaJs, FaMarkdown, FaRust, FaStar, FaPython } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { LuFileJson } from "react-icons/lu";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";
import React from "react";

interface TabStruct {
  file_name: string,
  file_content: string,
  file_path: string,
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
  const [items, setItems] = useState([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(true);
  const [opened, { toggle }] = useDisclosure(false);
  const [firstOpened, setFirstOpened] = useState(false);
  const [openLoader, setOpenLoader] = useState(false)

  const router = useRouter();

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
    if(file_name === activeTab) {
      return;
    }
    setOpenLoader(true);
    const section: any = file_path.replace(/\\/g, '/').split("/");
    const items = section.map((item: string, index: any) => (
      <Anchor key={index} className="text-sm" c="green">
        {item}
      </Anchor>
    ))
    setItems(items);
    if (tabs.find((tab) => tab.file_name == file_name && tab.file_path == file_path)) {
      handleTabChange(file_name);
      return;
    }

    invoke<string>("read_file", { path: file_path }).then((data: string) => {
      const newTab: TabStruct = { file_name: file_name, file_content: data, file_path: file_path }
      let newTabs = [newTab, ...tabs];
      setTabs(newTabs);
      setActiveTab(file_name);
      if (!firstOpened) {
        setFirstOpened(true);
      }
      setEditorData(newTab?.file_content || "");
      setDiagnostics([]);
      setOpenLoader(false);
    })
  };

  useEffect(() => {
    if (!editorData) return;
    setDiagnosticsLoading(true);
    invoke<string>("get_ai_response", { content: editorData }).then(res => {
      setDiagnostics(transformDiagnostics(res, editorData));
      setDiagnosticsLoading(false);

      const numOfVulns = JSON.parse(res).issues.length;
      if (numOfVulns > 0) {
        notifications.show({
          title: `${numOfVulns} vulnerabilities detected!`,
          message: "Expand the panel in the bottom right to learn more.",
          color: "green",
          autoClose: 2000,
          position: "top-right"
        })
      }
    });
  }, [editorData])

  const handleTabChange = (file_name: any) => {
    if(activeTab == file_name) {
      return;
    }
    let struct = tabs.find((tab) => tab.file_name == file_name);
    if (!struct) {
      return
    }
    if(opened) {
      toggle()
    }
    setBreadCrumbs(struct);
    setEditorData(struct?.file_content || "");
    setOpenLoader(false)
  }

  const handleClose = (e: string) => {
    let i = 0
    if (tabs.length == 0) {
      setTabs([])
    }
    if (tabs.find((tab) => tab.file_name == e)) {
      while (tabs[i].file_name != e) {
        i++;
      }
    }
    tabs.splice(i, 1);
    let newTabs = tabs;
    setTabs(newTabs);
    if (tabs.length >= 1) {
      handleTabChange(tabs[tabs.length - 1].file_name);
    } else {
      setEditorData("");
      setItems([])
      setActiveTab("")
      setDiagnostics([])
      setOpenLoader(false)
    }
  }

  const matchFileExtension = (file_name: any) => {
    const split = file_name.split(".")
    const ext = split[split.length - 1]
    if (!ext) {
      return <File className="pr-1" size={18} />
    }
    switch (ext) {
      case "js":
        return <FaJs size={15} color="yellow" />
      case "jsx":
        return <FaJs size={15} color="yellow" />
      case "mjs":
        return <FaJs size={15} color="yellow" />
      case "tsx":
        return <BiLogoTypescript size={16} color="#83b0e0" />
      case "ts":
        return <BiLogoTypescript size={16} color="#83b0e0" />
      case "css":
        return <FaCss3Alt size={16} color="#2d53e5" />
      case "png":
        return <FaFileImage size={16} color="#aa7eed" />
      case "jpg":
        return <FaFileImage size={16} color="#aa7eed" />
      case "jpeg":
        return <FaFileImage size={16} color="#aa7eed" />
      case "rs":
        return <FaRust size={16} color="#fa8796" />
      case "toml":
        return <FaGear size={16} color="#bfbdbe" />
      case "json":
        return <LuFileJson size={16} color="yellow" />
      case "html":
        return <FaHtml5 size={16} color="#994d48" />
      case "ico":
        return <FaStar size={16} color="yellow" />
      case "icns":
        return <FaStar size={16} color="yellow" />
      case "md":
        return <FaMarkdown size={16} color="green" />
      case "py":
        return <FaPython size={16} color="#689be3"/>
      default:
        return <File className="pr-1" size={18} />
    }
  }

  const setBreadCrumbs = (file_name: TabStruct) => {
    var section: any = file_name.file_path.replace(/\\/g, '/').split("/");
    const items = section.map((item: string, index: any) => (
      <Anchor key={index} className="text-sm" c="green">
        {item}
      </Anchor>
    ))
    setItems(items);
    setActiveTab(file_name.file_name);
  }

  return (
    <div className="flex flex-row h-screen">
      <div className="flex w-1/5 bg-transparent flex-col pl-2 pt-1 pr-2">
        <Button variant="transparent" color="green" className="w-fit pl-0" onClick={() => router.push("/")}>
          <ChevronLeft size={23}/>
        </Button>
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
                <Group gap={10} {...elementProps} className={`${activeTab == node.label ? "bg-[#d2fcef] bg-opacity-20" : ""} ${elementProps.className}`}>
                  {hasChildren && (
                    <ChevronDown
                      size={18}
                      style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    />
                  )}
                  <div
                    className="text-sm whitespace-nowrap flex items-center justify-center py-1"
                    onClick={() => !node.children && handleFileOpen(node.value, node.label)}
                  >
                    {!node.children && matchFileExtension(node.label)}
                    <span className={!node.children ? `ml-1` : ""}>{node.label}</span>
                  </div>
                </Group>
              )}
            />
          </ScrollArea>
        )}
      </div>
      <div className="w-4/5 h-screen flex flex-col bg-[#272c35] pointer-events-none">
        <ScrollArea className={`pointer-events-auto ${tabs.length == 0 ? "" : "min-h-16"}`} scrollbarSize={0}>
          <div className={`pb-1 ${tabs.length == 0 ? "" : "min-h-16"}`}>
            <Tabs allowTabDeactivation value={activeTab} onChange={(val) => handleTabChange(val)} keepMounted={false}>
              <Tabs.List className="flex-nowrap">
                {
                  tabs.map((tab) => {
                    return (
                      <Tabs.Tab value={tab.file_name} key={tab.file_name} color={"green"}>
                        <div className="flex items-center">
                          <div className="flex">
                            {matchFileExtension(tab.file_name)}
                            <span className="ml-2">{tab.file_name}</span>
                          </div>
                          <Button
                            onClick={() => handleClose(tab.file_name)}
                            variant="transparent"
                            className="w-fit h-fit pr-0"
                            color="green"
                          >
                            <X width={15} />
                          </Button>
                        </div>
                      </Tabs.Tab>
                    )
                  })
                }
              </Tabs.List>
            </Tabs>
          </div>
        </ScrollArea>
        <Breadcrumbs className="pl-4 pointer-events-auto">
          {items}
        </Breadcrumbs>
        <ScrollArea className="pointer-events-auto">
          {
            openLoader ? 
            <div className="w-4/5 h-screen flex items-center justify-center flex-col">
              <Loader color="green"/>
              <h1>Loading your file...</h1>
            </div> :
            <CodeMirror
              value={editorData}
              extensions={editorData.length != 0 ? [javascript(), linter((() => diagnostics)), lintGutter()] : []}
              theme={atomone}
              className={`${!firstOpened && "hidden"} pb-52`}
              readOnly
            />
          }
          
        </ScrollArea>
        {!firstOpened && !openLoader &&
          <div className="w-4/5 h-screen flex justify-center flex-col items-center">
            <h1 className="font-bold text-5xl bg-gradient-to-r from-[#1fd698] to-[#d1fef0] bg-clip-text text-transparent pb-1 mb-0">
              Cyberwright
            </h1>
            <h1 className="mt-0">Open a file to get started</h1>
          </div>
        }
        <div className={`fixed bottom-0 w-4/5 h-2/4 ${!firstOpened && "hidden"}`}>
          <Button onClick={toggle} className={`rounded-tr-lg z-10 pointer-events-auto ${!opened ? "absolute bottom-0 right-0 transition-all duration-200" : "right-0 absolute"}`} color="black">
            {
              opened ?
                <X color="#1fd698" className="mt-4"/> :
                diagnosticsLoading ? <Loader color="green" size={25}></Loader> : diagnostics.length > 0 ? 
                <div>
                  <Badge size="lg" circle color="red" className="text-xl">{diagnostics.length}</Badge>  
                </div> :
                <Plus color="#1fd698" />
            }
          </Button>
          <Collapse in={opened} className={`h-full bg-black mt-0 pt-3 ${opened ? "pointer-events-auto" : ""}`}>
            <h1 className="ml-10 text-2xl"><u>Vulnerabilities Identified</u></h1>
            {diagnosticsLoading ? (
            <>
              <div className="flex flex-col h-full items-center justify-center text-center -translate-y-10">
                <h1>Analyzing...</h1>
                <Progress className={"w-1/2"} color="green" size="xl" value={100} animated />
              </div>
            </>
            ) : (
              diagnostics.length == 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-center">
                  <h1>No issues found!</h1>
                </div>
              ) : (
                <ScrollArea className="h-full pointer-events-auto pb-20" h={"90%"} scrollbars="y">
                  {diagnostics.map((diag, index) => {
                    return (
                      <AiDialog key={index + 1} content={diag.message} id={index + 1} severity={diag.severity}/>
                    )
                  })}
                </ScrollArea>
              )
            )
            }

          </Collapse>
        </div>
      </div>
    </div>
  );
}