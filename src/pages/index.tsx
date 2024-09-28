import Editor from '@monaco-editor/react';

export default function Home() {
  return (
    <div className='flex flex-row'>
      <div className='flex w-1/5 bg-transparent'>
        <h1>test</h1>
      </div>
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