import { Link } from "@tanstack/react-router";
import { Factory } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/40 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Factory className="h-4 w-4" />
            </div>
            <span className="font-semibold">Industrial Knowledge Intelligence</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">AI-Powered Operations Brain for industrial teams.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/upload" className="hover:text-primary">Upload Documents</Link></li>
            <li><Link to="/chat" className="hover:text-primary">AI Assistant</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
            <li><Link to="/equipment" className="hover:text-primary">Equipment</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>support@iki.example</li>
            <li>+1 (555) 010-2024</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Industrial Knowledge Intelligence. All rights reserved.
      </div>
    </footer>
  );
}
