import { SelectItem } from '@shared/types';
import { ICellRendererParams } from 'ag-grid-community';
import { CustomColDef } from './TableComponent';

export interface SelectCellRendererParams extends ICellRendererParams {
  colDef: CustomColDef;
  value: string;
}

// Component for showing enriching state
const EnrichingIndicator = () => (
  <div className="flex items-center gap-2">
    <div className="h-2 w-2 rounded-full bg-green-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
    <span className="text-gray-500">Enriching...</span>
  </div>
);

// Component for rendering individual select items as pills
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
  const selectItems = props.colDef.context?.additionalTypeInformation?.selectItems || [];
  const value = props.value;

  // Handle special case for enriching
  if (value === 'Enriching...') {
    return <EnrichingIndicator />;
  }

  // Handle empty/null/undefined values
  if (!value) return <span></span>;

  // Ensure value is a string
  const stringValue = String(value);

  // For multiSelect, value might be comma-separated
  const values: string[] =
    props.colDef.type === 'multiSelect'
      ? stringValue
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean)
      : [stringValue];

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
