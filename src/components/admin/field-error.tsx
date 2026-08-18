export function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return (
    <span className="admin-field-error" id={id}>
      {errors.join(" ")}
    </span>
  );
}
