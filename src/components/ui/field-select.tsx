import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectItemData = {
  value: string;
  label: string;
};

export function FieldSelect({
  data,
  label,
  placeholder,
  description,
  action,
}: Readonly<{
  data: Array<SelectItemData>;
  label?: string;
  placeholder?: string;
  description?: string;
  action?: (item: SelectItemData) => void;
}>) {
  const handleValueChange = (value: string) => {
    const selectedItem = data.find((item) => item.value === value);
    if (selectedItem && action) {
      action(selectedItem);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Field>
        {label && <FieldLabel>{label}</FieldLabel>}
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder ?? "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {data.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    </div>
  );
}
