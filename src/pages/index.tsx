import Editor from '@monaco-editor/react';
import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';


export default function Home() {
  const [fileStructure, setFileStructure] = useState<FileStructure | null>(null);

  useEffect(() => {
    invoke<FileStructure>('get_file_structure', { path: "/insert/path/here" }).then((path) => {
      setFileStructure(path);
    });
  }, []);

  return (
    <div className='flex flex-row'>
      <div className='flex w-1/5 bg-transparent flex-col pl-2 pt-1'>
        <h1>test</h1>
        <h1>test2</h1>
      </div>
      <div className="flex w-1/5 bg-black">
        <div className='flex text-red-700 pl-30 pt-1'>
          <h1>1</h1>
        </div>
      </div>
      <p>ligma {JSON.stringify(fileStructure)}</p>
      <Editor
        height="100vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        theme='vs-dark'
        className='w-4/5'
        options={{ readOnly: true }}
      />
    </div>
  );
}