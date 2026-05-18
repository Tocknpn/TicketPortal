const bgColors = [
  "bg-tertiary-container text-on-tertiary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-primary-container text-on-primary-container",
];

export default function Avatar({ name, size = 8 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const color = bgColors[name.charCodeAt(0) % bgColors.length];
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center font-bold text-xs shrink-0`}>
      {initials}
    </div>
  );
}
