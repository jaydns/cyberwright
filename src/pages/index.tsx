import { Button } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderUp } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const [test, setTest] = useState<string>("");

  useEffect(() => {
    invoke<string>("get_ai_response", { content: "print('hello world!')" }).then(res => {
      setTest(res);
    });
  }, []);

  function handleInput(e: any) {
    open({
      directory: true,
      multiple: false
    }).then((selected: any) => {
      if (!selected) {
        return;
      }
      router.push(`/view?path=${encodeURI(selected)}`)
    })
  };

  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-bold text-5xl bg-gradient-to-r from-[#1fd698] to-[#d1fef0] bg-clip-text text-transparent pb-1 mb-0">
          Cyberwright
        </h1>
        <p className="text-xl mt-0">&quot;Cybersecurity done right&quot;</p>
        <p>sigma {test}</p>
      </div>

      <Button
        color="green"
        variant="light"
        leftSection={<FolderUp />}
        onClick={handleInput}
      >
        Open Folder
      </Button>
    </div>
  );
}