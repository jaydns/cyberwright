
export default function Home() {
  // const [fileStructure, setFileStructure] = useState<FileStructure | null>(null);

  // useEffect(() => {
  //   invoke<FileStructure>('get_file_structure', { path: "/insert/path/here" }).then((path) => {
  //     setFileStructure(path);
  //   });
  // }, []);

  return (
    <div className='flex flex-col w-screen h-screen items-center justify-center'>
      <div className="text-center">
        <h1
          className="font-bold text-5xl bg-gradient-to-r from-[#1fd698] to-[#d1fef0] bg-clip-text text-transparent pb-1"
        >
          Cyberwright
        </h1>
        <p className="text-xl mb-7">
          "Cybersecurity done right"
        </p>
      </div>
      <Button
        color="green.8"
        variant="light"
        leftSection={<FolderUp />}
      >
        Open Folder
      </Button>
    </div >
  );
}