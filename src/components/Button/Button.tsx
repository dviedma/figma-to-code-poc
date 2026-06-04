import styles from "./Button.module.css";

type ButtonProps = {
  label: string;
  size?: "sm" | "lg";
  href?: string;
  variant?: "primary";
};

export default function Button({
  label,
  size = "sm",
  href,
  variant = "primary",
}: ButtonProps) {
  const className = [
    styles.button,
    styles[`size-${size}`],
    styles[`variant-${variant}`],
  ].join(" ");

  if (href) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <button className={className} type="button">
      {label}
    </button>
  );
}
