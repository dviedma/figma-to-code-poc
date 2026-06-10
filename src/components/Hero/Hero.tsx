import Button from "@/components/Button/Button";
import styles from "./Hero.module.css";

type HeroProps = {
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
};

export default function Hero({
  heading = "Build better products, faster",
  subtitle = "Streamline your workflow with powerful tools designed for modern teams. Start free, scale effortlessly.",
  ctaLabel = "Start for free",
}: HeroProps) {
  return (
    <section className={styles.hero}>
      <h1 className={styles.heading}>{heading}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <Button label={ctaLabel} size="lg" href="#" />
    </section>
  );
}
