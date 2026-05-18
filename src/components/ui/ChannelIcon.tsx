interface Props { channel: string; className?: string }

const map: Record<string, { icon: string; color: string; label: string }> = {
  "Walk-in":   { icon: "person_pin",   color: "text-primary",      label: "Walk-in"   },
  "WATI":      { icon: "chat",         color: "text-[#25D366]",    label: "WhatsApp"  },
  "WhatsApp":  { icon: "chat",         color: "text-[#25D366]",    label: "WhatsApp"  },
  "Phone":     { icon: "call",         color: "text-primary",      label: "Phone"     },
  "Email":     { icon: "mail",         color: "text-secondary",    label: "Email"     },
  "Web Portal":{ icon: "language",     color: "text-tertiary",     label: "Web Portal"},
};

export default function ChannelIcon({ channel, className }: Props) {
  const info = map[channel] ?? { icon: "radio_button_unchecked", color: "text-on-surface-variant", label: channel };
  return (
    <span className={`flex items-center gap-1.5 text-[14px] text-on-surface-variant ${className ?? ""}`}>
      <span className={`material-symbols-outlined text-[18px] ${info.color}`}>{info.icon}</span>
      {info.label}
    </span>
  );
}
