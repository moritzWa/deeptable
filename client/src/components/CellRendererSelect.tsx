import { Column, SelectItem } from '@shared/types';
import { ICellRendererParams } from 'ag-grid-community';

export interface SelectCellRendererParams extends ICellRendererParams {
  colDef: Column;
  value: string;
}

// New component for rendering individual select items as pills
export const SelectPill = ({ value, color }: { value: string; color: string }) => {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-sm inline-flex items-center"
      style={{
        backgroundColor: `${color}20`, // Using 20% opacity version of the color
        color: color,
        border: `1px solid ${color}40`, // Using 40% opacity for border
      }}
    >
      {value}
    </span>
  );
};

export const SelectCellRenderer = (props: SelectCellRendererParams) => {
  const selectItems = props.colDef.additionalTypeInformation?.selectItems || [];
  const value = props.value;

  if (!value) return <span></span>;

  // For multiSelect, value might be comma-separated
  const values: string[] =
    props.colDef.type === 'multiSelect'
      ? value
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean)
      : [value];

  return (
    <div className="flex flex-wrap gap-1">
      {values.map((val: string, index: number) => {
        const selectItem = selectItems.find((item: SelectItem) => item.name === val);
        if (!selectItem) {
          // Fallback for values that don't have a matching select item
          return (
            <span key={index} className="text-gray-500">
              {val}
            </span>
          );
        }
        return <SelectPill key={selectItem.id} value={selectItem.name} color={selectItem.color} />;
      })}
    </div>
  );
};
