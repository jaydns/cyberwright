import { Diagnostic } from "@codemirror/lint";
import { AiFormat } from "./types";

export function transformDiagnostics(input: string | AiFormat, fileContent?: string): Diagnostic[] {
    let parsedInput: AiFormat;

    if (typeof input === 'string') {
        parsedInput = JSON.parse(input) as AiFormat;
    } else {
        parsedInput = input;
    }

    return parsedInput.issues.map(issue => {
        const line = fileContent ? fileContent.split('\n')[issue.lineNumber - 1] : '';
        const from = fileContent ? fileContent.split('\n').slice(0, issue.lineNumber - 1).join('\n').length + 1 : issue.lineNumber;
        const to = from + (line ? line.length : 0);

        return {
            from: from,
            to: to,
            severity: issue.severity === 'critical' ? 'error' : 'warning',
            message: issue.synopsis,
        };
    });
}