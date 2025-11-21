"use client";

import { Fragment, useMemo } from "react";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { generateBreadcrumbs } from "@/lib/breadcrum-helper";

export function AppHeader() {
    const pathname = usePathname();
    const breadcrumbs = useMemo(() => generateBreadcrumbs(pathname), [pathname]);

    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => {
                            const isLast = index === breadcrumbs.length - 1;

                            return (
                                <Fragment key={crumb.href}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={crumb.href}>
                                                {crumb.label}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast ? <BreadcrumbSeparator /> : null}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
            </div>
        </header>
    );
}
