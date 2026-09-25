import { cn } from "@/lib/utils";

interface ClientAvatarProps {
  name: string;
  className?: string;
}

const palette = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

const initials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

const hashIndex = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % palette.length;
  }
  return hash;
};

export const ClientAvatar = ({ name, className }: ClientAvatarProps) => {
  const colorClass = palette[hashIndex(name)] ?? palette[0];

  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full font-semibold",
        colorClass,
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
};
