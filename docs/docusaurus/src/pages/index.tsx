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
    "https://nick2bad4u.github.io/eslint-plugin-typedoc/img/logo_512x512.png";

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

const surfaceCards = [
    {
        description:
            "Browse the full rule catalog, examples, and preset strategy for gradual policy adoption.",
        title: "Rules reference",
        to: "/docs/rules/overview",
    },
    {
        description:
            "Review TypeDoc integration architecture, generation flow, and maintenance guidance.",
        title: "Developer docs",
        to: "/docs/developer/intro",
    },
    {
        description:
            "Inspect resolved ESLint configuration output and active rule layering in a dedicated UI.",
        title: "ESLint Inspector",
        to: "/eslint-inspector/",
    },
    {
        description:
            "Validate Stylelint configuration layering and output snapshots used by this repository.",
        title: "Stylelint Inspector",
        to: "/stylelint-inspector/",
    },
] as const;

const quickLinks = [
    {
        label: "Rules getting started",
        to: "/docs/rules/getting-started",
    },
    {
        label: "Preset matrix",
        to: "/docs/rules/presets",
    },
    {
        label: "TypeDoc pipeline",
        to: "/docs/developer/typedoc-pipeline",
    },
    {
        label: "Inspector workflows",
        to: "/docs/developer/inspectors",
    },
] as const;

const qualityPillars = [
    "TypeDoc-native lint rules",
    "Autofix-first rule ergonomics",
    "Synced README + preset matrices",
    "Generated API docs",
] as const;

export default function Home() {
    const logoSrc = useBaseUrl("/img/typedoc-logo-wordmark.png");

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
                            <p className={styles.heroEyebrow}>
                                TypeDoc + ESLint integration
                            </p>
                            <Heading as="h1" className={styles.heroTitle}>
                                eslint-plugin-typedoc
                            </Heading>
                            <p className={styles.heroSubtitle}>
                                Run documentation quality gates in the same lint
                                workflow as your code quality checks.
                            </p>
                            <ul className={styles.heroPillarList}>
                                {qualityPillars.map((pillar) => (
                                    <li
                                        className={styles.heroPillarItem}
                                        key={pillar}
                                    >
                                        {pillar}
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.heroActions}>
                                <Link
                                    className={`button button--primary button--lg ${styles.heroActionButton}`}
                                    to="/docs/rules/overview"
                                >
                                    Explore rules
                                </Link>
                                <Link
                                    className={`button button--secondary button--lg ${styles.heroActionButton}`}
                                    to="/docs/developer/intro"
                                >
                                    Developer docs
                                </Link>
                            </div>
                        </div>

                        <aside className={styles.heroPanel}>
                            <img
                                alt="TypeDoc logo with eslint-plugin-typedoc wordmark"
                                className={styles.heroPanelLogo}
                                decoding="async"
                                height="160"
                                loading="eager"
                                src={logoSrc}
                                width="520"
                            />
                        </aside>
                    </div>

                    <GitHubStats className={styles.heroLiveBadges} />
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className="container">
                    <div className={styles.cardGrid}>
                        {surfaceCards.map((card) => (
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
                <section className={`container ${styles.quickLinksSection}`}>
                    <Heading as="h2" className={styles.quickLinksTitle}>
                        Quick paths
                    </Heading>
                    <div className={styles.quickLinksGrid}>
                        {quickLinks.map((link) => (
                            <Link
                                className={styles.quickLinkCard}
                                key={link.label}
                                to={link.to}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </Layout>
    );
}
