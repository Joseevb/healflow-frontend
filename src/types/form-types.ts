import type { ComponentType, HTMLInputAutoCompleteAttribute, ReactNode } from "react";

/**
 * Defines the orientation of the field or field group.
 * - 'vertical': Label, control, and description are stacked (default).
 * - 'horizontal': Label and control are side-by-side.
 * - 'responsive': Label and control are horizontal on larger screens, vertical on smaller screens.
 */
export type Orientation = "vertical" | "horizontal" | "responsive";

/**
 * Configuration for grouping fields side-by-side within a FieldGroup.
 */
export type GroupConfig = {
  /** The name of the group. Fields with the same group name will be rendered together in a FieldGroup. */
  name: string;
  /** The orientation of the fields inside this group. Overrides the field's individual orientation. */
  orientation?: Orientation;
  /** Custom className applied to the FieldGroup container. */
  className?: string;
  /** If true, adds a FieldSeparator between fields in this group. */
  separator?: boolean;
};

export type SetConfig = {
  /** The legend text for the field, rendered using FieldLegend. */
  legend?: string;
  /** The description text for the field, rendered using FieldDescription. */
  description?: string;
  /** Custom className applied to the control element. */
  controlClassName?: string;
};

/**
 * Base configuration shared by all field types.
 * @template TValue The expected value type for the field.
 */
type BaseFieldConfig = {
  /** A user-friendly title for the field, rendered using FieldTitle. */
  title?: string;
  /** A user-friendly label for the field, rendered using FieldLabel. */
  label: string;
  /** The field type discriminator. */
  type: string;
  /** Placeholder text for the input control. */
  placeholder?: string;
  /** Additional description text, rendered using FieldDescription. */
  description?: string;
  /** Orientation of the field (vertical, horizontal, or responsive). */
  orientation?: Orientation;
  /** Custom className applied to the root Field component. */
  className?: string;
  /** Custom className applied to the control component. */
  controlClassName?: string;
  /** Group configuration for side-by-side field grouping. */
  group?: GroupConfig;
  /** Set name for wrapping fields in a FieldSet (higher precedence than group). */
  set?: SetConfig;
};

type TextInputType = "text" | "email" | "password" | "number" | "tel" | "url" | "file" | "date";

/**
 * Configuration for standard HTML input types.
 */
export type InputFieldConfig = BaseFieldConfig & {
  type: TextInputType;
  autocomplete?: HTMLInputAutoCompleteAttribute;
  /** Icon to be displayed inside the input control. */
  icon?: React.ReactNode;
};

/**
 * Configuration for composable end text that displays a string property value.
 */
export type ComposableEndText = {
  /** A valid property or method name of the string object (e.g., 'length', 'toUpperCase') */
  valueField: keyof string;
  /** Message to display after the computed value (e.g., '/ 100 characters') */
  message: string;
};

/**
 * Configuration for textarea fields.
 */
export type TextareaFieldConfig = BaseFieldConfig & {
  type: "textarea";
  rows?: number;
  endText?: ComposableEndText;
};

/**
 * Configuration for select dropdown fields.
 */
export type SelectFieldConfig<TValue> = BaseFieldConfig & {
  type: "select";
  options: Array<{
    label: string;
    value: TValue extends string ? TValue : string;
  }>;
};

/**
 * Configuration for radio group fields.
 */
export type RadioFieldConfig<TValue> = BaseFieldConfig & {
  type: "radio";
  options: Array<{
    label: string;
    value: TValue extends string ? TValue : string;
    description?: string;
  }>;
  size?: "small" | "large";
};

/**
 * Configuration for checkbox fields (single boolean).
 */
export type CheckboxFieldConfig = BaseFieldConfig & {
  type: "checkbox";
};

export type CheckboxGroupFieldConfig<TValue> = BaseFieldConfig & {
  type: "checkbox-group";
  items: Array<{
    label: string;
    value: TValue extends Array<infer ItemType> ? ItemType : string;
    orientation?: Orientation;
  }>;
};

/**
 * Configuration for switch fields (boolean toggle).
 */
export type SwitchFieldConfig = BaseFieldConfig & {
  type: "switch";
};

/**
 * Configuration for slider fields with a single number value.
 */
type SliderSingleValueConfig = BaseFieldConfig & {
  type: "slider";
  /** Single value mode */
  range?: false;
  /** Minimum value for the slider. */
  min: number;
  /** Maximum value for the slider. */
  max: number;
  /** Step increment for the slider. */
  step?: number;
  /** Default value must be a number. */
  defaultValue?: number;
};

/**
 * Configuration for slider fields with a range (array of two numbers).
 */
type SliderRangeConfig = BaseFieldConfig & {
  type: "slider";
  /** Range mode enabled */
  range: true;
  /** Minimum value for the slider. */
  min: number;
  /** Maximum value for the slider. */
  max: number;
  /** Step increment for the slider. */
  step?: number;
  /** Default value must be an array of two numbers [min, max]. */
  defaultValue?: [number, number];
};

/**
 * Union type for slider field configs.
 */
export type SliderFieldConfig = SliderSingleValueConfig | SliderRangeConfig;

export type CustomFieldConfig = {
  type: "custom";
  render: ReactNode;
};

export type ObjectFieldConfig<TValue> = BaseFieldConfig & {
  type: "object";
  /** Recursively define fields for the nested object */
  fields: FieldConfigs<TValue extends Record<string, unknown> ? TValue : never>;
};

/**
 * Discriminating union of all field configuration types.
 */
export type FieldConfig<TValue = unknown> =
  | InputFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig<TValue>
  | RadioFieldConfig<TValue>
  | CheckboxFieldConfig
  | CheckboxGroupFieldConfig<TValue>
  | SwitchFieldConfig
  | SliderFieldConfig
  | CustomFieldConfig
  | ObjectFieldConfig<TValue>;

/**
 * Helper type: A FieldConfig that is NOT a nested object.
 * This is used for the leaf-node renderer to ensure type safety in the default switch case.
 */
export type PrimitiveFieldConfig<TValue = unknown> = Exclude<
  FieldConfig<TValue>,
  { type: "object" }
>;

/**
 * Utility type to extract a specific field config type by its type discriminator.
 * @example
 * type TextareaConfig = ExtractFieldConfig<'textarea'> // TextareaFieldConfig
 * type SliderConfig = ExtractFieldConfig<'slider'> // SliderFieldConfig
 */
export type ExtractFieldConfig<TType extends FieldConfig["type"]> = Extract<
  FieldConfig,
  { type: TType }
>;

/**
 * Record of field configurations keyed by field names.
 */
export type FieldConfigs<TValues extends Record<string, unknown>> = {
  [K in keyof TValues]: FieldConfig<TValues[K]>;
};

export type CommonFieldProps = {
  label: string;
  className?: string;
  description?: string;
  placeholder?: string;
  orientation?: Orientation;
};

export type FieldRenderApi = {
  TextAreaField: ComponentType<CommonFieldProps & { rows?: number; endText?: ComposableEndText }>;
  SelectField: ComponentType<
    CommonFieldProps & { options: Array<{ label: string; value: unknown }> }
  >;
  RadioField: ComponentType<
    CommonFieldProps & {
      options: Array<{ label: string; value: unknown; description?: string }>;
      size?: "small" | "large";
    }
  >;
  CheckboxField: ComponentType<CommonFieldProps>;
  CheckboxGroupField: ComponentType<
    CommonFieldProps & {
      items: Array<{ label: string; value: unknown; orientation?: Orientation }>;
    }
  >;
  SwitchField: ComponentType<CommonFieldProps>;
  SliderField: ComponentType<
    CommonFieldProps & {
      min: number;
      max: number;
      step?: number;
      title?: string;
      range?: boolean;
    }
  >;
  TextField: ComponentType<
    CommonFieldProps & {
      type: string;
      autocomplete?: HTMLInputAutoCompleteAttribute;
      icon?: ReactNode;
    }
  >;
};

export type FormApi = {
  AppField: ComponentType<{
    name: string;
    children: (field: FieldRenderApi) => ReactNode;
  }>;
};
