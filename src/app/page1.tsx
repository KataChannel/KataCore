import { ThemeErrorBoundary } from '@/components/ThemeErrorBoundary';
import { UnifiedThemeDemo } from '@/components/UnifiedThemeDemo';

export default function HomePage() {
  return (
    <ThemeErrorBoundary>
      <main className="min-h-screen bg-background">
        <UnifiedThemeDemo />
      </main>
    </ThemeErrorBoundary>
  );
}