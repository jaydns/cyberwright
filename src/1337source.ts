import { Diagnostic } from "@codemirror/lint";
import { EditorView } from "@uiw/react-codemirror";

export const leetLinter =
    () =>
        (view: EditorView): Diagnostic[] => {
            const text = view.state.doc.toString();
            const diagnostics: Diagnostic[] = [];
            const lines = text.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('text')) {
                    diagnostics.push({
                        from: i,
                        to: i + 1,
                        message: 'the message in qestion',
                        severity: 'error' // or warning
                    });
                }
            }
            return diagnostics;
        }

