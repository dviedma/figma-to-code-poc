import Card from "@/components/Card/Card";
import styles from "./FeatureCards.module.css";

const CARDS = [
  {
    title: "Fast Collaboration",
    description:
      "Work together in real-time with your team. Share, comment, and iterate at the speed of thought.",
  },
  {
    title: "Powerful Analytics",
    description:
      "Gain deep insights into your product usage. Make data-driven decisions with confidence.",
  },
  {
    title: "Seamless Integrations",
    description:
      "Connect your favourite tools effortlessly. Works with the apps you already rely on every day.",
  },
];

export default function FeatureCards() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Everything you need to succeed</h2>
      <div className={styles.grid}>
        {CARDS.map((card) => (
          <Card key={card.title} title={card.title} description={card.description} />
        ))}
      </div>
    </section>
  );
}
