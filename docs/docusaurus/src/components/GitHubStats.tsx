import Link from "@docusaurus/Link";

import styles from "../pages/index.module.css";

type GitHubStatsProps = {
    readonly className?: string;
};

type LiveBadge = {
    readonly alt: string;
    readonly href: string;
    readonly src: string;
};

const liveBadges = [
    {
        alt: "npm license",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typedoc/blob/main/LICENSE",
        src: "https://flat.badgen.net/npm/license/eslint-plugin-typedoc?color=purple",
    },
    {
        alt: "npm total downloads",
        href: "https://www.npmjs.com/package/eslint-plugin-typedoc",
        src: "https://flat.badgen.net/npm/dt/eslint-plugin-typedoc?color=pink",
    },
    {
        alt: "latest GitHub release",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typedoc/releases",
        src: "https://flat.badgen.net/github/release/Nick2bad4u/eslint-plugin-typedoc?color=cyan",
    },
    {
        alt: "GitHub stars",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typedoc/stargazers",
        src: "https://flat.badgen.net/github/stars/Nick2bad4u/eslint-plugin-typedoc?color=yellow",
    },
] as const satisfies readonly LiveBadge[];

export default function GitHubStats({ className = "" }: GitHubStatsProps) {
    const badgeListClassName = [styles.liveBadgeList, className]
        .filter(Boolean)
        .join(" ");

    return (
        <ul className={badgeListClassName}>
            {liveBadges.map((badge) => (
                <li key={badge.src} className={styles.liveBadgeListItem}>
                    <Link
                        className={styles.liveBadgeAnchor}
                        href={badge.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            alt={badge.alt}
                            className={styles.liveBadgeImage}
                            decoding="async"
                            loading="lazy"
                            src={badge.src}
                        />
                    </Link>
                </li>
            ))}
        </ul>
    );
}
