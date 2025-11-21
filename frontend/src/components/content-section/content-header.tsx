import * as React from "react";
import { TypographyH2 } from "../ui/typography";
import { Button } from "../ui/button";
import { ArrowLeft, LucideIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContentHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  btnText?: string;
  btnIcon?: LucideIcon;
  onBtnClick?: () => void;
  showBtn?: boolean;
  showBackBtn?: boolean;
}

import { cn } from "@/lib/utils";

export function ContentHeader({
  className,
  title,
  btnText = "New",
  btnIcon: Icon = Plus,
  onBtnClick,
  showBtn = false,
  showBackBtn = false,
  ...props
}: ContentHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("mb-3 flex justify-between items-center", className)} {...props}>
      <div className="flex items-center gap-2">
        {showBackBtn && (
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <TypographyH2>{title}</TypographyH2>
      </div>
      {showBtn && (
        <Button onClick={onBtnClick}>
          <Icon />
          {btnText}
        </Button>
      )}
    </div>
  );
}
