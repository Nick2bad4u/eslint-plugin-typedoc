import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import GitHubStats from "../components/GitHubStats";

import styles from "./index.module.css";

export default function Home() {
    return (
        <Layout
            title="TypeDoc-focused linting for modern TypeScript projects"
            description="Integrate TypeDoc validation, reporting, and autofixing directly into ESLint workflows."
        >
            <Head>
                <meta
                    content="eslint-plugin-typedoc, typedoc, eslint, typescript"
                    name="keywords"
                />
            </Head>
            <header className={styles.heroBanner}>
                <div className={`container ${styles.heroContent}`}>
                    <Heading as="h1" className={styles.heroTitle}>
                        eslint-plugin-typedoc
                    </Heading>
                    <p className={styles.heroSubtitle}>
                        Integrate TypeDoc validation, reporting, and autofixing
                        directly into ESLint workflows.
                    </p>
                    <div className={styles.heroActions}>
                        <Link
                            className={`button button--primary button--lg ${styles.heroActionButton}`}
                            to="/docs/getting-started"
                        >
                            Get started
                        </Link>
                        <Link
                            className={`button button--secondary button--lg ${styles.heroActionButton}`}
                            to="/docs/rules/overview"
                        >
                            Browse rules
                        </Link>
                    </div>
                    <GitHubStats className={styles.heroLiveBadges} />
                </div>
            </header>
        </Layout>
    );
}
