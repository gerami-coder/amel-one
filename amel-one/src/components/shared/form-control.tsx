import { useId, cloneElement, type ReactElement } from "react";
type Props = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }>;
};
export function FormControl({ label, hint, error, children }: Props) {
  const id = useId();
  const description = [hint ? id + "-hint" : "", error ? id + "-error" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="form-control">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, {
        id,
        "aria-describedby": description || undefined,
        "aria-invalid": !!error,
      })}
      {hint && <small id={id + "-hint"}>{hint}</small>}
      {error && (
        <small id={id + "-error"} className="field-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
