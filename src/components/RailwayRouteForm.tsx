"use client";

import { RailwayRouteWithFetchCompositionProps } from "@/lib/RailwayRouteAnimation/constants";
import Form from "@rjsf/shadcn";
import type { UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import React from "react";
import { toast } from "sonner";
import zodToJsonSchema from "zod-to-json-schema";
import { CustomSelectWidget } from "./CustomSelect";

interface RailwayRouteFormProps {
  formData: any;
  onChange: (data: any) => void;
}

const uiSchema: UiSchema = {
  segments: {
    "ui:widget": "hidden",
  },
  tileStyle: {
    "ui:widget": "customSelect",
    "ui:placeholder": "Select map style",
  },
  routeMethod: {
    "ui:widget": "customSelect",
    "ui:placeholder": "Select route method",
  },
};

export const RailwayRouteForm: React.FC<RailwayRouteFormProps> = ({
  formData: externalFormData,
  onChange,
}) => {
  const schema = zodToJsonSchema(RailwayRouteWithFetchCompositionProps) as any;

  const handleChange = (data: any) => {
    onChange(data.formData);
  };

  const widgets = {
    customSelect: CustomSelectWidget,
  };

  return (
    <div className="w-full">
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={externalFormData}
        validator={validator}
        widgets={widgets}
        liveValidate
        showErrorList={false}
        onSubmit={(e) => {
          handleChange(e);
          toast.success("Form submitted");
        }}
      />
    </div>
  );
};
