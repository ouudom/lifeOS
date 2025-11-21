export interface BreadcrumbItem {
    href: string;
    label: string;
}

/**
 * Checks if a segment is likely an ID or dynamic parameter
 */
function isLikelyId(segment: string, index: number): boolean {
    // UUID pattern (8-4-4-4-12 hexadecimal format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(segment)) {
        return true;
    }

    // Numeric IDs (pure numbers)
    if (/^\d+$/.test(segment)) {
        return true;
    }

    // MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-f]{24}$/i.test(segment)) {
        return true;
    }

    // Short hash-like IDs (8+ alphanumeric characters without meaningful words)
    if (segment.length >= 8 && /^[a-z0-9]+$/i.test(segment) && index > 0) {
        return true;
    }

    return false;
}

/**
 * Formats a breadcrumb segment into a readable label
 */
function formatSegment(segment: string, index: number): string {
    // If it's likely an ID, return "Detail"
    if (isLikelyId(segment, index)) {
        return "Detail";
    }

    // Convert kebab-case to Title Case
    return segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

/**
 * Generates breadcrumb items from a pathname
 * @param pathname - The current pathname (e.g., "/dashboard/journals/123")
 * @returns Array of breadcrumb items with href and label
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split("/").filter(Boolean);

    // Default to dashboard if no segments
    if (segments.length === 0) {
        return [{ href: "/dashboard", label: "Dashboard" }];
    }

    return segments.map((segment, index) => ({
        href: `/${segments.slice(0, index + 1).join("/")}`,
        label: formatSegment(segment, index),
    }));
}
