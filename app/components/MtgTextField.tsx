"use client";

import { AutocompleteRenderInputParams, TextField } from "@mui/material";
import { FC, ChangeEvent } from "react";

export const MtgTextField: FC<{
  label: string;
  name: string;
  value?: string;
  params?: AutocompleteRenderInputParams;
  slotProps?: {
    chip?: object;
    clearIndicator?: object;
    listbox?: object;
    paper?: object;
    popper?: object;
    popupIndicator?: object;
    input?: object;
  };
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}> = ({ label, name, value, params, onChange, slotProps }) => {
  return (
    <TextField
      {...params}
      label={label}
      name={name}
      className="w-full sm:w-full md:w-auto"
      sx={{
        marginBottom: 2,
      }}
      value={value}
      onChange={onChange}
      onFocus={(event) => event.target.select()}
      {...slotProps}
    />
  );
};
