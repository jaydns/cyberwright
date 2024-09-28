import Editor from '@monaco-editor/react';

export default function Landing() {
    return (
        <div className='flex flex-row'>
            <div className='flex w-1/5 bg-transparent flex-col pl-2 pt-1 pr-2'>
                <div className='text-lg border-b-2 border-neutral-450 pl-1'>
                    <h1>Folder Name</h1>
                </div>
                <div className="pl-3">
                    <div className='flex justify-between'> 
                        <h1>test</h1>
                        <div className=' text-red-700 pr-2'>
                            <h1>1</h1>
                        </div>
                    </div>
               </div>
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
    )
}