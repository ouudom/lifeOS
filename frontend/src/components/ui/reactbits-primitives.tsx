"use client";

import * as React from "react";
import { HTMLMotionProps, motion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils"

/**
 * ReactBits-inspired primitives reconstructed locally so we can keep the
 * interactive look-and-feel without relying on unpublished packages.
 */

interface MagicBentoProps extends HTMLMotionProps<"div"> {
  intensity?: number;
  enableTilt?: boolean;
  children?: React.ReactNode;
}

export const MagicBento = React.forwardRef<HTMLDivElement, MagicBentoProps>(
  ({ className, intensity = 14, enableTilt = true, children, ...props }, ref) => {
    const [pointer, setPointer] = React.useState({ x: "50%", y: "50%" });
    const rotateX = useSpring(0, { stiffness: 200, damping: 22 });
    const rotateY = useSpring(0, { stiffness: 200, damping: 22 });
    const pointerVars = React.useMemo<React.CSSProperties & Record<string, string | number>>(
      () => ({
        "--pointer-x": pointer.x.toString(),
        "--pointer-y": pointer.y.toString(),
      }),
      [pointer.x, pointer.y]
    );

    const handlePointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        const rect = element.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const percentX = (offsetX - centerX) / centerX;
        const percentY = (offsetY - centerY) / centerY;

        if (enableTilt) {
          rotateX.set(percentY * -intensity);
          rotateY.set(percentX * intensity);
        }

        setPointer({
          x: `${(offsetX / rect.width) * 100}%`,
          y: `${(offsetY / rect.height) * 100}%`,
        });
      },
      [enableTilt, intensity, rotateX, rotateY]
    );

    const handlePointerLeave = React.useCallback(() => {
      rotateX.set(0);
      rotateY.set(0);
      setPointer({ x: "50%", y: "50%" });
    }, [rotateX, rotateY]);

    return (
      <motion.div
        ref={ref}
        className={cn(
          "group relative rounded-[32px] border border-border/60 bg-background/70 backdrop-blur-xl transition duration-300",
          "before:absolute before:inset-0 before:-z-10 before:rounded-[40px] before:bg-gradient-to-r before:from-primary/30 before:via-fuchsia-500/20 before:to-transparent before:opacity-40 before:blur-3xl",
          className
        )}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          ...pointerVars,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/80">
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(650px circle at var(--pointer-x,50%) var(--pointer-y,50%), rgba(99,102,241,0.18), transparent 55%)",
            }}
          />
          <div className="relative">{children}</div>
        </div>
      </motion.div>
    );
  }
);
MagicBento.displayName = "MagicBento";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
}

export const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ className, spotlightColor = "rgba(99,102,241,0.22)", children, ...props }, ref) => {
    const [coords, setCoords] = React.useState({ x: "50%", y: "50%", opacity: 0 });
    const spotlightVars = React.useMemo<React.CSSProperties & Record<string, string | number>>(
      () => ({
        "--spotlight-x": coords.x,
        "--spotlight-y": coords.y,
      }),
      [coords.x, coords.y]
    );

    const handleMouseMove = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setCoords({ x: `${x}%`, y: `${y}%`, opacity: 1 });
    }, []);

    const handleMouseLeave = React.useCallback(() => {
      setCoords((prev) => ({ ...prev, opacity: 0 }));
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 transition duration-300",
          "before:absolute before:inset-0 before:bg-[radial-gradient(450px_circle_at_var(--spotlight-x,_50%)_var(--spotlight-y,_50%),_rgba(255,255,255,0.12),_transparent_60%)] before:opacity-0 before:transition-opacity before:duration-300",
          "after:absolute after:-inset-px after:rounded-[inherit] after:bg-gradient-to-br after:from-white/10 after:via-transparent after:to-transparent after:opacity-0 after:transition-opacity after:duration-300",
          "hover:before:opacity-100 hover:after:opacity-100",
          className
        )}
        style={{
          ...spotlightVars,
          boxShadow: `0 22px 45px -28px ${spotlightColor}`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div className="relative z-[1]">{children}</div>
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${coords.x} ${coords.y}, ${spotlightColor}, transparent 55%)`,
            opacity: coords.opacity,
          }}
        />
      </div>
    );
  }
);
SpotlightCard.displayName = "SpotlightCard";

interface GlareCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  highlightColor?: string;
}

export const GlareCard = React.forwardRef<HTMLDivElement, GlareCardProps>(
  (
    {
      className,
      glowColor = "rgba(168,85,247,0.35)",
      highlightColor = "rgba(255,255,255,0.18)",
      children,
      ...props
    },
    ref
  ) => {
    const [coords, setCoords] = React.useState({ x: 50, y: 50, angle: 0 });
    const [isHovering, setIsHovering] = React.useState(false);

    const glareVars = React.useMemo<React.CSSProperties & Record<string, string | number>>(
      () => ({
        "--glare-x": `${coords.x}%`,
        "--glare-y": `${coords.y}%`,
        "--glare-angle": `${coords.angle}deg`,
        "--glare-opacity": isHovering ? 1 : 0,
      }),
      [coords.x, coords.y, coords.angle, isHovering]
    );

    const updatePointer = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const x = (offsetX / rect.width) * 100;
      const y = (offsetY / rect.height) * 100;
      const angle = Math.atan2(offsetY - rect.height / 2, offsetX - rect.width / 2) * (180 / Math.PI);

      setCoords({ x, y, angle });
    }, []);

    const handlePointerEnter = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        setIsHovering(true);
        updatePointer(event);
      },
      [updatePointer]
    );

    const handlePointerLeave = React.useCallback(() => {
      setIsHovering(false);
      setCoords({ x: 50, y: 50, angle: 0 });
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-[32px] border border-border/70 bg-background/75 shadow-[0_34px_80px_-48px_rgba(15,23,42,0.65)] transition duration-500",
          "hover:border-border/40 hover:shadow-[0_36px_95px_-45px_rgba(168,85,247,0.45)]",
          className
        )}
        style={glareVars}
        onPointerMove={updatePointer}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10 transition duration-500"
          style={{ opacity: "calc(var(--glare-opacity, 0) * 0.8)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 transition duration-500"
          style={{
            opacity: "var(--glare-opacity, 0)",
            background:
              "radial-gradient(240px circle at var(--glare-x,50%) var(--glare-y,50%), rgba(255,255,255,0.22), transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute -inset-24 blur-3xl transition duration-500"
          style={{
            opacity: "calc(var(--glare-opacity, 0) * 0.7)",
            background: `radial-gradient(360px circle at var(--glare-x,50%) calc(var(--glare-y,50%) + 12%), ${glowColor}, transparent 70%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 transition duration-500"
          style={{
            opacity: "calc(var(--glare-opacity, 0) * 0.75)",
            background: `linear-gradient(135deg, ${highlightColor}, transparent 55%)`,
            mixBlendMode: "screen",
          }}
        />
      </div>
    );
  }
);
GlareCard.displayName = "GlareCard";

interface ElectricButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulse?: boolean;
}

export const ElectricButton = React.forwardRef<HTMLButtonElement, ElectricButtonProps>(
  ({ className, pulse = true, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-gradient-to-b from-[#f6f6ff]/90 via-[#fbfaff]/80 to-[#ececf6]/85 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-foreground/90 transition duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-28px_rgba(168,85,247,0.72)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 text-foreground/90">{children}</span>
      <span className="pointer-events-none absolute inset-0 rounded-full border border-white/40" />
      <span
        className={cn(
          "pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-r from-[#c084fc]/35 via-[#f0abfc]/30 to-[#818cf8]/35 blur-2xl",
          pulse && "animate-pulse"
        )}
      />
    </button>
  )
);
ElectricButton.displayName = "ElectricButton";
