import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface MetaDescriptionProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

const MetaDescription = <T extends FieldValues = FieldValues>({ control, name }: MetaDescriptionProps<T>) => (
    <Controller
      name={name}
      control={control}
    render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
            <textarea
        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
        rows={3}
        placeholder="Meta description for SEO..."
        value={field.value}
        onChange={e => field.onChange(e.target.value)}
      />
    )}
    />
  );

export default MetaDescription; 