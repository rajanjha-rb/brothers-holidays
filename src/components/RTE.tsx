"use client";

import dynamic from "next/dynamic";

import Editor from "@uiw/react-md-editor";

// for more information, see https://mdxeditor.dev/editor/docs/getting-started

// This is the only place InitializedMDXEditor is imported directly.
const RTE = dynamic(
    () =>
        import("@uiw/react-md-editor").then(mod => {
            return mod.default;
        }),
    { 
        ssr: false,
        loading: () => (
            <div className="w-full h-64 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading editor...</p>
                </div>
            </div>
        )
    }
);

export const MarkdownPreview = Editor.Markdown;

export default RTE;