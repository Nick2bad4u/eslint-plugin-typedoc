import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import GitHubStats from "../components/GitHubStats";
import styles from "./index.module.css";

const homepageDescription =
    "ESLint rules for TypeDoc documentation quality, validation, and autofix workflows.";
const homepageKeywords =
    "eslint-plugin-typedoc, typedoc, eslint, documentation linting, typescript";
const homepageSocialImageUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typedoc/img/logo.png";

const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    codeRepository: "https://github.com/Nick2bad4u/eslint-plugin-typedoc",
    description: homepageDescription,
    image: homepageSocialImageUrl,
    license:
        "https://github.com/Nick2bad4u/eslint-plugin-typedoc/blob/main/LICENSE",
    name: "eslint-plugin-typedoc",
    programmingLanguage: "TypeScript",
    runtimePlatform: "Node.js",
    url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/",
} as const;

const cards = [
    {
        description:
            "Install the plugin and start surfacing documentation diagnostics in ESLint.",
        title: "Get Started",
        to: "/docs/rules/getting-started",
    },
    {
        description:
            "Compare minimal, recommended, strict, and all presets for gradual adoption.",
        title: "Presets",
        to: "/docs/rules/presets",
    },
    {
        description:
            "Browse all TypeDoc-focused rules with examples, behavior notes, and migration guidance.",
        title: "Rule Reference",
        to: "/docs/rules/overview",
    },
] as const;

export default function Home() {
    const logoSrc = useBaseUrl("/img/logo.svg");

    return (
        <Layout
            title="TypeDoc validation in ESLint"
            description={homepageDescription}
        >
            <Head>
                <meta content={homepageKeywords} name="keywords" />
                <meta content={homepageSocialImageUrl} property="og:image" />
                <meta content="summary_large_image" name="twitter:card" />
                <meta content={homepageSocialImageUrl} name="twitter:image" />
                <script type="application/ld+json">
                    {JSON.stringify(homepageStructuredData)}
                </script>
            </Head>

            <header className={styles.heroBanner}>
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroGrid}>
                        <div>
                            <Heading as="h1" className={styles.heroTitle}>
                                eslint-plugin-typedoc
                            </Heading>
                            <p className={styles.heroSubtitle}>
                                Integrate TypeDoc checks, reporting, and safe
                                autofixes directly into ESLint workflows.
                            </p>
                            <div className={styles.heroActions}>
                                <Link
                                    className={`button button--primary button--lg ${styles.heroActionButton}`}
                                    to="/docs/rules/getting-started"
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
                        </div>

                        <aside className={styles.heroPanel}>
                            <img
                                alt="eslint-plugin-typedoc logo"
                                className={styles.heroPanelLogo}
                                decoding="async"
                                height="220"
                                loading="eager"
                                src={logoSrc}
                                width="220"
                            />
                        </aside>
                    </div>

                    <GitHubStats className={styles.heroLiveBadges} />
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className="container">
                    <div className={styles.cardGrid}>
                        {cards.map((card) => (
                            <article key={card.title} className={styles.card}>
                                <Heading as="h2" className={styles.cardTitle}>
                                    {card.title}
                                </Heading>
                                <p className={styles.cardDescription}>
                                    {card.description}
                                </p>
                                <Link className={styles.cardLink} to={card.to}>
                                    Open section →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </Layout>
    );
}
