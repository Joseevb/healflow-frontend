import { Input } from "@/components/ui/input";

export type AddressObject = {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

export function AddressEditor({
  value,
  onChange,
  title,
}: {
  value?: AddressObject;
  onChange: (next: AddressObject) => void;
  title?: string;
}) {
  const current = value ?? {};
  const patch = (patchObj: AddressObject) => onChange({ ...current, ...patchObj });

  // Simple two-row layout: Street/City, then State/Zip
  return (
    <div className="space-y-2">
      {title && <div className="text-sm font-semibold mb-1">{title}</div>}
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Street"
          value={current.street ?? ""}
          onChange={(e) => patch({ street: e.target.value })}
        />
        <Input
          placeholder="City"
          value={current.city ?? ""}
          onChange={(e) => patch({ city: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="State"
          value={current.state ?? ""}
          onChange={(e) => patch({ state: e.target.value })}
        />
        <Input
          placeholder="Zip code"
          value={current.zipCode ?? ""}
          onChange={(e) => patch({ zipCode: e.target.value })}
        />
      </div>
    </div>
  );
}
