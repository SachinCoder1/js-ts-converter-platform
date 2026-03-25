import { SidebarProvider } from '@/components/sidebar/sidebar-context';
import { Sidebar } from '@/components/sidebar/sidebar';
import { ToolHeader } from '@/components/tool-header';
import { SkipLinks } from '@/components/shared/skip-links';
import { KeyboardShortcutsModal } from '@/components/shared/keyboard-shortcuts-modal';
import { AnnouncerProvider } from '@/components/shared/screen-reader-announcer';
import { Footer } from '@/components/footer';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SkipLinks />
      <KeyboardShortcutsModal />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <ToolHeader />
          <main className="flex flex-1 flex-col">
            <AnnouncerProvider>
              {children}
            </AnnouncerProvider>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
