import React from "react";
import type {
  FieldConfigs,
  FieldRenderApi,
  FormApi,
  Orientation,
  PrimitiveFieldConfig,
} from "@/types/form-types";
import type { LayoutNode } from "@/lib/form-layout";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { buildLayoutTree } from "@/lib/form-layout";
import { cn } from "@/lib/utils";
import { withForm } from "@/hooks/form-context";

const getOrientationClasses = (orientation: Orientation = "vertical") => {
  switch (orientation) {
    case "horizontal":
      return "grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4 items-end";
    case "responsive":
      return "grid grid-cols-1 md:grid-cols-2 gap-4";
    case "vertical":
    default:
      return "flex flex-col gap-4";
  }
};

function FieldContentRenderer({
  field,
  config,
}: {
  field: FieldRenderApi;
  config: PrimitiveFieldConfig<unknown>;
}) {
  switch (config.type) {
    case "textarea":
      return (
        <field.TextAreaField
          rows={config.rows}
          label={config.label}
          endText={config.endText}
          className={config.className}
          description={config.description}
          placeholder={config.placeholder}
        />
      );
    case "select":
      return (
        <field.SelectField
          label={config.label}
          options={config.options}
          className={config.className}
          description={config.description}
          placeholder={config.placeholder}
        />
      );
    case "radio":
      return (
        <field.RadioField
          size={config.size}
          label={config.label}
          options={config.options}
          className={config.className}
          orientation={config.orientation}
          description={config.description}
          placeholder={config.placeholder}
        />
      );
    case "checkbox":
      return (
        <field.CheckboxField
          label={config.label}
          className={config.className}
          orientation={config.orientation}
          description={config.description}
          placeholder={config.placeholder}
        />
      );
    case "checkbox-group":
      return (
        <field.CheckboxGroupField
          items={config.items}
          label={config.label}
          className={config.className}
          orientation={config.orientation}
          description={config.description}
          placeholder={config.placeholder}
        />
      );
    case "switch":
      return (
        <field.SwitchField
          label={config.label}
          className={config.className}
          orientation={config.orientation}
          description={config.description}
        />
      );
    case "slider":
      return (
        <field.SliderField
          min={config.min}
          max={config.max}
          step={config.step}
          title={config.title}
          label={config.label}
          className={config.className}
          description={config.description}
          range={config.range}
        />
      );
    case "custom":
      return config.render;
    default:
      return (
        <field.TextField
          type={config.type}
          label={config.label}
          className={config.className}
          description={config.description}
          autocomplete={config.autocomplete}
          icon={config.icon}
        />
      );
  }
}

function LayoutNodeRenderer({
  node,
  form,
  parentPath = "",
}: {
  node: LayoutNode;
  form: FormApi;
  parentPath?: string;
}) {
  switch (node.type) {
    case "set":
      return (
        <FieldSet className={node.config.controlClassName}>
          {node.config.legend && <FieldLegend>{node.config.legend}</FieldLegend>}
          {node.config.description && (
            <FieldDescription>{node.config.description}</FieldDescription>
          )}
          <div className="flex flex-col gap-4">
            {node.children.map((child, idx) => (
              <LayoutNodeRenderer key={idx} node={child} form={form} parentPath={parentPath} />
            ))}
          </div>
        </FieldSet>
      );
    case "group": {
      const orientationClass = getOrientationClasses(node.config.orientation);

      return (
        <FieldGroup className={cn(orientationClass, node.config.className)}>
          {node.children.map((child, idx) => (
            <React.Fragment key={idx}>
              <LayoutNodeRenderer node={child} form={form} parentPath={parentPath} />
              {/* Handle Separator Logic if needed */}
              {node.config.separator && idx < node.children.length - 1 && (
                <div className="w-px bg-border h-full mx-2 hidden md:block" />
              )}
            </React.Fragment>
          ))}
        </FieldGroup>
      );
    }
    case "field": {
      const fullPath = parentPath ? `${parentPath}.${node.name}` : node.name;

      // Handle Nested Objects Recursively
      if (node.config.type === "object") {
        const nestedLayout = buildLayoutTree(node.config.fields);
        return (
          <div className={cn("space-y-4", node.config.className)}>
            {node.config.title && <FieldTitle>{node.config.title}</FieldTitle>}
            {node.config.description && (
              <FieldDescription>{node.config.description}</FieldDescription>
            )}
            {nestedLayout.map((childNode, idx) => (
              <LayoutNodeRenderer
                key={idx}
                node={childNode}
                form={form}
                parentPath={fullPath} // Pass the accumulated path down
              />
            ))}
          </div>
        );
      }

      // Standard Fields
      return (
        <form.AppField name={fullPath}>
          {(field) => (
            <FieldContentRenderer
              field={field}
              config={node.config as PrimitiveFieldConfig<unknown>}
            />
          )}
        </form.AppField>
      );
    }
    default:
      return null;
  }
}

// --- 3. The Main Builder Component ---
export function FormBuilder<TData extends Record<string, unknown>>({
  fieldConfigs,
  form,
}: {
  fieldConfigs: FieldConfigs<TData>;
  form: FormApi;
}) {
  const layout = React.useMemo(() => buildLayoutTree(fieldConfigs), [fieldConfigs]);

  return (
    <div className="space-y-6">
      {layout.map((node, idx) => (
        <LayoutNodeRenderer key={idx} node={node} form={form} />
      ))}
    </div>
  );
}

export const dynamicFormFactory = <TFormData extends Record<string, unknown>>({
  fieldConfigs,
  defaultValues,
}: {
  title?: string;
  description?: string;
  fieldConfigs: FieldConfigs<TFormData>;
  defaultValues: TFormData;
}) =>
  withForm({
    props: {
      buttonGroup: <></>,
    },
    render: function Render({ form, buttonGroup }) {
      return (
        <form.AppForm>
          <form.Form>
            <FormBuilder fieldConfigs={fieldConfigs} form={form as any} />
            {buttonGroup}
          </form.Form>
        </form.AppForm>
      );

      // return (
      //   <form.AppForm>
      //     <form.Form>
      //       <Card>
      //         <CardContent className="pt-6">
      //           <div className="mb-6">
      //             <FieldTitle className="text-xl">{title}</FieldTitle>
      //             {description && <FieldDescription>{description}</FieldDescription>}
      //           </div>

      //           <FormBuilder fieldConfigs={fieldConfigs} form={form as any} />
      //         </CardContent>
      //         <CardFooter className="flex gap-3">
      //           <form.SubscribeButton label="Submit" />
      //           <form.ResetButton label="Reset" />
      //         </CardFooter>
      //       </Card>
      //     </form.Form>
      //   </form.AppForm>
      // );
    },
    defaultValues,
  });
