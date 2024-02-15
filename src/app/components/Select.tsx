import {
    Select,
    SelectItem,
  } from '@tremor/react';
  
  export default function SelectHeader({ title }: { title: string }) {
    return (
      <div className="mx-auto max-w-xs">
        <div className="mb-4 text-center font-mono text-sm text-slate-500">
          {title}
        </div>
        <Select defaultValue="1">
          <SelectItem value="1">Developer Experience</SelectItem>
        </Select>
      </div>
    );
  }