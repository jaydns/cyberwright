import { Button } from "@mantine/core";
import { FolderUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-bold text-5xl bg-gradient-to-r from-[#1fd698] to-[#d1fef0] bg-clip-text text-transparent pb-1">
          Cyberwright
        </h1>
        <p className="text-xl mb-7">&quot;Cybersecurity done right&quot;</p>
      </div>
      <Button color="green.8" variant="light" leftSection={<FolderUp />}>
        Open Folder
      </Button>
    </div>
  );
}
