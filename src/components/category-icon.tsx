import {
  Boxes, CalendarDays, Camera, Film, Fingerprint, Megaphone, Mic,
  MonitorSmartphone, Palette, PenTool, Printer, Shapes, ShoppingBag,
  Sparkles, Video, WandSparkles, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  palette: Palette,
  fingerprint: Fingerprint,
  camera: Camera,
  video: Video,
  film: Film,
  "wand-sparkles": WandSparkles,
  megaphone: Megaphone,
  "shopping-bag": ShoppingBag,
  "monitor-smartphone": MonitorSmartphone,
  "pen-tool": PenTool,
  boxes: Boxes,
  sparkles: Sparkles,
  printer: Printer,
  "calendar-days": CalendarDays,
  mic: Mic,
  shapes: Shapes,
};

export function CategoryIcon({ icon, size = 20, className = "" }: { icon: string; size?: number; className?: string }) {
  const Icon = ICONS[icon] ?? Sparkles;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
