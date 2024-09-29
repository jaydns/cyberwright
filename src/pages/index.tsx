import RecentOpen from "@/components/RecentOpen";
import { recent_open } from "@/types";
import { Button } from "@mantine/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Store } from '@tauri-apps/plugin-store';
import { FolderUp } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const store = new Store('.recent_opens.bin');

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [recentOpens, setRecentOpens] = useState<recent_open[]>([]);

  useEffect(() => {
    store.get("recent_opens").then((data: any) => {
      if (!data) {
        return;
      }
      setRecentOpens(data);
    })
  }, []);

  function handleInput(e: any) {
    open({
      directory: true,
      multiple: false
    }).then((selected: any) => {
      if (!selected) {
        return;
      }
      store.set("recent_opens", [...recentOpens, { folder_path: selected, folder_name: selected.split("/").pop() }]).then(() => {
        store.save().then(() => {
          router.push(`/view?path=${encodeURI(selected)}`)
        });
      });

    })
  };

  return (
    <div>
      <div className="absolute top-10 left-10">
        <h1 className="text-lg mb-0">Recent Opens:</h1>
        {recentOpens.map((recent, index) => {
          return <RecentOpen key={index} {...recent} />
        }
        )}
      </div>
      <div className="flex flex-col w-screen h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-bold text-5xl bg-gradient-to-r from-[#1fd698] to-[#d1fef0] bg-clip-text text-transparent pb-1 mb-0">
            Cyberwright
          </h1>
          <p className="text-xl mt-0">&quot;Cybersecurity done right&quot;</p>
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
    </div>
  );
}