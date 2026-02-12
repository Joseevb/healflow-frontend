import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  CheckboxField,
  CheckboxGroupField,
  FormRoot,
  RadioField,
  ResetButton,
  SelectField,
  SliderField,
  SubscribeButton,
  SwitchField,
  TextAreaField,
  TextField,
} from "@/components/form-fields";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    RadioField,
    SelectField,
    SwitchField,
    SliderField,
    TextAreaField,
    CheckboxField,
    CheckboxGroupField,
  },
  formComponents: {
    ResetButton,
    SubscribeButton,
    Form: FormRoot,
  },
});
