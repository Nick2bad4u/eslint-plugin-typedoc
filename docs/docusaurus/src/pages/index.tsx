import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";

import GitHubStats from "../components/GitHubStats";
import styles from "./index.module.css";

type HeroStat = Readonly<{
    description: string;
    title: string;
}>;

type SurfaceCard = Readonly<{
    description: string;
    icon: string;
    title: string;
    to: string;
}>;

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

const homeCards = [
    {
        description:
            "Install the plugin, enable a preset, and start surfacing TypeDoc issues directly in ESLint.",
        icon: "\u{F135}",
        title: "Get Started",
        to: "/docs/rules/getting-started",
    },
    {
        description:
            "Compare minimal, recommended, strict, and all presets for gradual documentation policy adoption.",
        icon: "\u{E690}",
        title: "Presets",
        to: "/docs/rules/presets",
    },
    {
        description:
            "Browse the full TypeDoc-focused rule catalog with examples, migration notes, and autofix behavior.",
        icon: "\u{F02D}",
        title: "Rule Reference",
        to: "/docs/rules",
    },
] as const satisfies readonly SurfaceCard[];

const qualityPillars = [
    "Autofix-first rule ergonomics",
    "Generated API docs",
    "TypeDoc-native lint rules",
] as const;

const heroStats = [
    {
        description:
            "Coverage for tag hygiene, generic docs, examples, package docs, and markdown snippets.",
        title: "\u{F0CA} 20+ Documentation Rules",
    },
    {
        description:
            "Start with recommended, tighten with strict, or enable the full rule catalog.",
        title: "\u{E690} 4 Presets",
    },
    {
        description:
            "Safe autofixes and suggestions keep docs cleanup practical in normal lint workflows.",
        title: "\u{F0068} DX-first Autofix",
    },
] as const satisfies readonly HeroStat[];

/**
 * Render the Docusaurus documentation homepage.
 *
 * @returns The docs landing page layout.
 */
export default function Home() {
    const logoSrc = useBaseUrl("/img/logo_512x512.png");

    return (
        <Layout
            description={homepageDescription}
            title="TypeDoc validation in ESLint"
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
                                    to="/docs/intro"
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

                    <div className={styles.heroStats}>
                        {heroStats.map((stat) => (
                            <article
                                className={styles.heroStatCard}
                                key={stat.title}
                            >
                                <p className={styles.heroStatHeading}>
                                    {stat.title}
                                </p>
                                <p className={styles.heroStatDescription}>
                                    {stat.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className="container">
                    <div className={styles.cardGrid}>
                        {homeCards.map((card) => (
                            <article className={styles.card} key={card.title}>
                                <div className={styles.cardHeader}>
                                    <p className={styles.cardIcon}>
                                        {card.icon}
                                    </p>
                                    <Heading
                                        as="h2"
                                        className={styles.cardTitle}
                                    >
                                        {card.title}
                                    </Heading>
                                </div>
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
