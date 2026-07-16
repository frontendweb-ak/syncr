import { Check } from "lucide-react";
import { AUTH_ASIDE_CONTENT } from "../constants/auth-side.constants";
import type { AuthAsideVariant } from "../types";

type Props = {
  variant: AuthAsideVariant;

  className?: string;

  title?: string;
  description?: string;
};

export function AuthAside({ variant, className, title, description }: Props) {
  const content = AUTH_ASIDE_CONTENT[variant];

  const Icon = content.icon;

  return (
    <aside
      className={[
        "relative  justify-center flex items-center h-full overflow-hidden rounded-3xl",
        "bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700",
        "p-12 text-white lg:flex lg:flex-col lg:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="max-w-[400] items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-white/20" />
        </div>

        <div className="relative z-10">
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Icon className="h-8 w-8" />
          </div>

          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-white/70">
            {content.eyebrow}
          </p>

          <h2 className="mb-6 text-4xl font-bold leading-tight">
            {title ?? content.title}
          </h2>

          <p className="max-w-md text-lg leading-8 text-white/80">
            {description ?? content.description}
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {content.features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur"
            >
              <Check className="h-5 w-5 shrink-0" />

              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
