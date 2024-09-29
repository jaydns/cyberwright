import { Diagnostic } from "@codemirror/lint";
import { Store } from '@tauri-apps/plugin-store';
import { EditorView } from "@uiw/react-codemirror";
import { createHash } from "crypto";

const store = new Store('.vulns.dat')

export const leetLinter =
    () =>
        (view: EditorView): Diagnostic[] => {
            const text = view.state.doc.toString();
            const diagnostics: Diagnostic[] = [];

            const hash = createHash('sha256').update(text).digest('hex');

            // const lines = text.split('\n');
            // for (let i = 0; i < lines.length; i++) {
            //     const line = lines[i];
            //     if (line.includes('text')) {
            //         diagnostics.push({
            //             from: i,
            //             to: i + 1,
            //             message: 'the message in qestion',
            //             severity: 'error' // or warning
            //         });
            //     }
            // }
            return diagnostics;
        }

