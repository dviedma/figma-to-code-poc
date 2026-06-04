import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.brand}>Acme Corp</span>
      <span className={styles.copyright}>
        &copy; {new Date().getFullYear()} Acme Corp. All rights reserved.
      </span>
      <nav className={styles.links}>
        <a href="#" className={styles.link}>Privacy</a>
        <a href="#" className={styles.link}>Terms</a>
        <a href="#" className={styles.link}>Contact</a>
      </nav>
    </footer>
  );
}
