import Card from "@/components/Card/Card";
import styles from "./FeatureCards.module.css";

const CARDS = [
  {
    title: "Blazing fast performance",
    description:
      "Deliver experiences that load instantly and respond in real time, keeping your users engaged and happy.",
  },
  {
    title: "Built for collaboration",
    description:
      "Work together seamlessly with your team. Real-time updates, shared workspaces, and role-based access built in.",
  },
  {
    title: "Enterprise-grade security",
    description:
      "SOC 2 compliant, end-to-end encrypted, and audited regularly. Your data stays safe, always.",
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
