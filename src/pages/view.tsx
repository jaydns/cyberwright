import Editor from "@monaco-editor/react";
import { ChevronDown } from "lucide-react";
import React, { useState } from 'react';
import { Tree, Group } from '@mantine/core';
import { data } from './data';


export default function Landing() {

  return (
    <div className="flex flex-row h-screen">
      <div className="flex w-1/5 bg-transparent flex-col pl-2 pt-1 pr-2">
      <Tree
      data={data}
      levelOffset={23}
      renderNode={({ node, expanded, hasChildren, elementProps }) => (
        <Group gap={5} {...elementProps}>
          {hasChildren && (
            <ChevronDown
              size={18}
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          )}

          <span>{node.label}</span>
        </Group>
      )}
    />
      </div>
      <div className="w-4/5 h-screen flex flex-col">
        <Editor
          className="mb-0"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          options={{ readOnly: true }}
        />
        <div className="h-1/5 mb-0 mt-0 bg-[#121212]">
          <h1 className="text-center">D1 YAPPING</h1>
        </div>
      </div>
    </div>
  );
}