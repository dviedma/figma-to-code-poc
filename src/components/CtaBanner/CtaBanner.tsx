import Button from "@/components/Button/Button";
import styles from "./CtaBanner.module.css";

type CtaBannerProps = {
  heading?: string;
  subtext?: string;
  ctaLabel?: string;
};

export default function CtaBanner({
  heading = "Ready to get started?",
  subtext = "Join thousands of teams already using Acme Corp to build better products, faster.",
  ctaLabel = "Get started for free",
}: CtaBannerProps) {
  return (
    <section className={styles.banner}>
      <h2 className={styles.heading}>{heading}</h2>
      <p className={styles.subtext}>{subtext}</p>
      <Button label={ctaLabel} size="lg" href="#" />
    </section>
  );
}
