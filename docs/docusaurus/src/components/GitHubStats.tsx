import type { ReactElement } from "react";

import Link from "@docusaurus/Link";

import styles from "./GitHubStats.module.css";

interface GitHubStatsProps {
    readonly className?: string;
}

interface LiveBadge {
    readonly alt: string;
    readonly href: string;
    readonly src: string;
}

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
    {
        alt: "GitHub forks",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typedoc/forks",
        src: "https://flat.badgen.net/github/forks/Nick2bad4u/eslint-plugin-typedoc?color=green",
    },
    {
        alt: "GitHub open issues",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typedoc/issues",
        src: "https://flat.badgen.net/github/open-issues/Nick2bad4u/eslint-plugin-typedoc?color=red",
    },
    {
        alt: "Codecov",
        href: "https://app.codecov.io/gh/Nick2bad4u/eslint-plugin-typedoc",
        src: "https://flat.badgen.net/codecov/github/Nick2bad4u/eslint-plugin-typedoc?color=blue",
    },
] as const satisfies readonly LiveBadge[];

/**
 * Renders live repository, package, and mutation badges.
 *
 * @param props - Optional list class override.
 *
 * @returns Badge strip with links to package/repository metadata.
 */
export default function GitHubStats({
    className = "",
}: GitHubStatsProps): ReactElement {
    const liveBadgeAnchorClassName = styles["liveBadgeAnchor"] ?? "";
    const liveBadgeImageClassName = styles["liveBadgeImage"] ?? "";
    const liveBadgeListClassName = [styles["liveBadgeList"] ?? "", className]
        .filter(Boolean)
        .join(" ");
    const liveBadgeListItemClassName = styles["liveBadgeListItem"] ?? "";

    return (
        <ul className={liveBadgeListClassName}>
            {liveBadges.map((badge) => (
                <li className={liveBadgeListItemClassName} key={badge.src}>
                    <Link
                        className={liveBadgeAnchorClassName}
                        href={badge.href}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <img
                            alt={badge.alt}
                            className={liveBadgeImageClassName}
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
