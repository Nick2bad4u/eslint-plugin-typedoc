const enhanceExternalLinks = (): void => {
    for (const link of document.querySelectorAll<HTMLAnchorElement>(
        'a[href^="http"]'
    )) {
        if (link.target.length === 0) {
            link.target = "_blank";
        }

        if (!link.rel.includes("noopener")) {
            link.rel =
                link.rel.length === 0
                    ? "noopener noreferrer"
                    : `${link.rel} noopener noreferrer`;
        }
    }
};

const bootstrapEnhancements = (): void => {
    document.documentElement.dataset["jsEnhanced"] = "true";
    enhanceExternalLinks();
};

if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootstrapEnhancements, {
            once: true,
        });
    } else {
        bootstrapEnhancements();
    }
}
