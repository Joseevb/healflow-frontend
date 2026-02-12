import { Slider } from "@radix-ui/react-slider";
import { Switch } from "@radix-ui/react-switch";
import { Activity } from "react";
import type { ExtractFieldConfig, InputFieldConfig } from "@/types/form-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFieldContext, useFormContext } from "@/hooks/form-context";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export function TextField({
  label,
  type = "text",
  placeholder,
  description,
  autocomplete,
  icon,
}: InputFieldConfig) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {icon ? (
        <InputGroup>
          <InputGroupInput
            type={type}
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid}
            placeholder={placeholder}
            autoComplete={autocomplete}
          />
          <InputGroupAddon align={"inline-start"}>{icon}</InputGroupAddon>
        </InputGroup>
      ) : (
        <Input
          type={type}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          placeholder={placeholder}
          autoComplete={autocomplete}
        />
      )}
      <FieldDescription>{description}</FieldDescription>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function TextAreaField({
  rows = 6,
  label,
  endText,
  className,
  description,
  placeholder,
}: Omit<ExtractFieldConfig<"textarea">, "type">) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  // Resolve endText to a string
  const resolvedEndText = (() => {
    if (!endText) return null;
    if (typeof endText === "string") return endText;

    const value = field.state.value;
    const fieldValue = (value as any)[endText.valueField];
    const resolvedFieldValue =
      typeof fieldValue === "function" ? fieldValue.call(value) : fieldValue;

    return `${resolvedFieldValue}${endText.message}`;
  })();

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupTextarea
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={className}
          aria-invalid={isInvalid}
        />
        {resolvedEndText && (
          <InputGroupAddon align="block-end">
            <InputGroupText className="tabular-nums">{resolvedEndText}</InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
      <FieldDescription>{description}</FieldDescription>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function SelectField({
  label,
  options = [],
  className,
  description,
  placeholder,
}: Omit<ExtractFieldConfig<"select">, "type">) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
        <Select value={field.state.value} onValueChange={field.handleChange}>
          <SelectTrigger id={field.name} aria-invalid={isInvalid} className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldContent>
    </Field>
  );
}

export function RadioField({
  size = "small",
  label,
  options,
  orientation,
  description,
}: Omit<ExtractFieldConfig<"radio">, "type">) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  if (size === "small") {
    return (
      <FieldSet>
        <FieldLegend>{label}</FieldLegend>
        {description && <FieldDescription>{description}</FieldDescription>}

        <RadioGroup
          name={field.name}
          value={field.state.value}
          onValueChange={field.handleChange}
          className="flex flex-col gap-3"
        >
          {options.map((option) => (
            <Field key={option.value} orientation={orientation} data-invalid={isInvalid}>
              <RadioGroupItem
                value={option.value}
                id={`form-tanstack-radiogroup-${option.value}`}
                aria-invalid={isInvalid}
              />
              <div className="grid gap-1.5 leading-none">
                <FieldLabel
                  htmlFor={`form-tanstack-radiogroup-${option.value}`}
                  className="font-normal cursor-pointer"
                >
                  {option.label}
                </FieldLabel>
                {option.description && (
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                )}
              </div>
            </Field>
          ))}
        </RadioGroup>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldSet>
    );
  }

  return (
    <FieldSet>
      <FieldLegend>{label}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <RadioGroup name={field.name} value={field.state.value} onValueChange={field.handleChange}>
        {options.map((option) => (
          <FieldLabel
            key={`form-tanstack-radiogroup-${option.value}`}
            htmlFor={`form-tanstack-radiogroup-${option.value}`}
          >
            <Field orientation={orientation} data-invalid={isInvalid}>
              <FieldContent>
                <FieldTitle>{option.label}</FieldTitle>
                <FieldDescription>{option.description}</FieldDescription>
              </FieldContent>
              <RadioGroupItem
                value={option.value}
                id={`form-tanstack-radiogroup-${option.value}`}
                aria-invalid={isInvalid}
              />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </FieldSet>
  );
}

export function CheckboxField({
  label,
  isSwitch = false,
  orientation,
}: Omit<ExtractFieldConfig<"checkbox">, "type"> & { isSwitch?: boolean }) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field orientation={orientation}>
      {isSwitch ? (
        <Switch
          id={`form-tanstack-${label}`}
          name={field.name}
          checked={field.state.value}
          onCheckedChange={(checked: boolean) => field.handleChange(checked === true)}
        />
      ) : (
        <Checkbox
          id={`form-tanstack-${label}`}
          name={field.name}
          checked={field.state.value}
          onCheckedChange={(checked: boolean) => field.handleChange(checked === true)}
        />
      )}
      <FieldLabel htmlFor={`form-tanstack-${label}`}>{label}</FieldLabel>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function CheckboxGroupField({
  label,
  items,
  description,
}: Omit<ExtractFieldConfig<"checkbox-group">, "type">) {
  const field = useFieldContext<Array<string>>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <FieldSet>
      <FieldLegend variant="label">{label}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldGroup data-slot="checkbox-group">
        {items.map(({ label: itemLabel, value, orientation }) => {
          return (
            <Field key={value} orientation={orientation} data-invalid={isInvalid}>
              <Checkbox
                id={`form-tanstack-checkbox-${value}`}
                name={field.name}
                checked={field.state.value.includes(value)}
                onCheckedChange={(checked) => {
                  const currentValues = field.state.value;
                  return checked
                    ? field.handleChange([...currentValues, value])
                    : field.handleChange(currentValues.filter((v) => v !== value));
                }}
                value={value}
              />
              <FieldLabel htmlFor={`form-tanstack-checkbox-${value}`} className="font-normal">
                {itemLabel}
              </FieldLabel>
            </Field>
          );
        })}
      </FieldGroup>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </FieldSet>
  );
}

export function SwitchField({
  label,
  orientation = "horizontal",
}: Omit<ExtractFieldConfig<"switch">, "type">) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field orientation={orientation}>
      <FieldLabel htmlFor={`form-tanstack-${label}`}>{label}</FieldLabel>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function SliderField({
  min,
  max,
  step,
  title,
  label,
  className,
  description,
  range,
}: Omit<ExtractFieldConfig<"slider">, "type">) {
  const field = useFieldContext();
  const isInvalid = !!field.state.meta.errors.length;

  const handleChange = (newValue: Array<number>) =>
    range ? field.handleChange(newValue) : field.handleChange(newValue[0]);

  const sliderValue = Array.isArray(field.state.value)
    ? field.state.value
    : [field.state.value ?? min];

  return (
    <FieldSet>
      <FieldLegend>{title}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Slider
        value={sliderValue}
        onValueChange={handleChange}
        max={max}
        min={min}
        step={step}
        className={cn("mt-2 w-full", className)}
        aria-label={label}
        data-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </FieldSet>
  );
}

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          <Activity mode={isSubmitting ? "visible" : "hidden"}>
            <Spinner />
          </Activity>
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}

export function ResetButton({ label }: { label: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="reset"
          disabled={isSubmitting}
          variant="secondary"
          onClick={() => form.reset()}
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}

export function FormRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const form = useFormContext();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={className}
    >
      {children}
    </form>
  );
}
