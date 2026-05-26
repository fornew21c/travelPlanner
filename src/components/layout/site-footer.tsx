import Link from "next/link";
import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm">
            © {new Date().getFullYear()} AI 패밀리 트래블 플래너. 모든 권리 보유.
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">개인정보 처리방침</Link>
          <Link href="/terms" className="hover:text-foreground">이용약관</Link>
          <Link href="/contact" className="hover:text-foreground">문의</Link>
        </nav>
      </div>
    </footer>
  );
}
