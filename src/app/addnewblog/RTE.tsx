import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { storage } from "@/models/client/config";
import { featuredImageBucket } from "@/models/name";
import { ID } from "appwrite";

interface RTEProps<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  label?: string;
  defaultValue?: string;
}

const RTE = <T extends FieldValues = FieldValues>({ name, control, label, defaultValue = "" }: RTEProps<T>) => {
  return (
    <div className="w-full">
      {label && <label className="inline-block mb-1 pl-1">{label}</label>}
      <Controller
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={(name || "content") as any}
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaultValue={defaultValue as any}
        render={({ field: { onChange, value, ref } }) => (
          <Editor
            value={value ?? ""}
            apiKey="x2cczbg7x6lgcl7pfozt3g5ba99cod35798c2ci6u0etbdbf"
            init={{
              height: 500,
              menubar: true,
              plugins: [
                "image",
                "advlist",
                "autolink",
                "lists",
                "link",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | image | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              file_picker_types: 'image',
              file_picker_callback: async (cb: (url: string, meta: { title: string }) => void, value: string, meta: { filetype: string }) => {
                if (meta.filetype === 'image') {
                  const input = document.createElement('input');
                  input.setAttribute('type', 'file');
                  input.setAttribute('accept', 'image/*');
                  input.onchange = async function () {
                    const file = (this as HTMLInputElement).files?.[0];
                    if (file) {
                      try {
                        const uploaded = await storage.createFile(
                          featuredImageBucket,
                          ID.unique(),
                          file
                        );
                        const url = storage.getFileView(
                          featuredImageBucket,
                          uploaded.$id
                        ).toString();
                        cb(url, { title: file.name });
                      } catch {
                        alert("Image upload failed. Please try again.");
                      }
                    }
                  };
                  input.click();
                }
              },
            }}
            onEditorChange={onChange}
            textareaName={name}
            onBlur={ref}
          />
        )}
      />
    </div>
  );
};

export default RTE;
