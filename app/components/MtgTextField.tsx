"use client";

import { TextField } from "@mui/material";
import { FC, ChangeEvent } from "react";

export const MtgTextField: FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}> = ({ label, name, value, onChange }) => {
  return (
    <TextField
      label={label}
      name={name}
      className="w-full sm:w-full md:w-auto"
      sx={{
        marginBottom: 2,
      }}
      value={value}
      onChange={onChange}
      onFocus={(event) => event.target.select()}
    />
  );
};
