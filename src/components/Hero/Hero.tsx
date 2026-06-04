import Button from "@/components/Button/Button";
import styles from "./Hero.module.css";

type HeroProps = {
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
};

export default function Hero({
  heading = "Build products your customers will love",
  subtitle = "Acme Corp gives your team the tools to ship faster, collaborate smarter, and scale with confidence.",
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
