
import { Monitor, Laptop, Tablet, Smartphone } from 'lucide-react';

export const deviceSizes = {
  desktop: { width: 1920, height: 1080, label: 'Desktop', icon: Monitor, scale: 0.5 },
  laptop: { width: 1366, height: 768, label: 'Laptop', icon: Laptop, scale: 0.7 },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: Tablet, scale: 0.8 },
  phone: { width: 375, height: 667, label: 'Phone', icon: Smartphone, scale: 1.2 }
};