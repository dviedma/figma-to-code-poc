import Button from "@/components/Button/Button";
import styles from "./Nav.module.css";

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <a href="/" className={styles.logo}>
        Acme Corp
      </a>
      <Button label="Get Started" href="#" size="sm" />
    </nav>
  );
}
