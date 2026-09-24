import Link from "next/link";
import { ReactNode } from "react";
import { AdminLogout } from "@/components/admin-logout";

type AdminShellProps = {
  active: "dashboard" | "diy-products" | "events" | "extras" | "site-content" | "reviews" | "inquiries";
  children: ReactNode;
  productCount: number;
};

// Provides the shared navigation frame for all manager workspaces.
export function AdminShell({ active, children, productCount }: AdminShellProps) {
  return <main className="admin-shell">
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <Link className="admin-brand" href="/admin">Get2Gether<span>Manager</span></Link>
      <p className="admin-sidebar-label">Workspace</p>
      <nav>
        <Link href="/admin/inquiries" className={`admin-nav-item${active === "inquiries" ? " admin-nav-item-active" : ""}`}>Inquiry inbox</Link>
        <Link href="/admin" className={`admin-nav-item${active === "dashboard" ? " admin-nav-item-active" : ""}`}>Dashboard</Link>
        <Link href="/admin/site-content" className={`admin-nav-item${active === "site-content" ? " admin-nav-item-active" : ""}`}>Pages & text</Link>
        <Link href="/admin/events" className={`admin-nav-item${active === "events" ? " admin-nav-item-active" : ""}`}>Event listings</Link>
        <Link href="/admin/diy-products" className={`admin-nav-item${active === "diy-products" ? " admin-nav-item-active" : ""}`}>DIY products <b>{productCount}</b></Link>
        <Link href="/admin/extras" className={`admin-nav-item${active === "extras" ? " admin-nav-item-active" : ""}`}>Extra offerings</Link>
        <Link href="/admin/reviews" className={`admin-nav-item${active === "reviews" ? " admin-nav-item-active" : ""}`}>Reviews</Link>
      </nav>
      <AdminLogout />
      <div className="admin-sidebar-bottom"><Link href="/?lang=en" className="admin-nav-item">View site</Link><p>Signed in as<br /><strong>manager</strong></p></div>
    </aside>
    <section className="admin-content">{children}</section>
  </main>;
}
