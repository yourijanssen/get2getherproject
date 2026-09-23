import { AdminShell } from "@/components/admin-shell";

const workspaces = [
  {
    title: "Site content",
    description: "Edit page titles, the home page and website text in Greek and English.",
    href: "/admin/site-content",
    action: "Edit site content",
  },
  {
    title: "Events",
    description: "Keep upcoming gatherings and workshop details organised.",
    href: "/admin/events",
    action: "Manage events",
  },
  {
    title: "DIY products",
    description: "Add, edit, publish and sort the products shown on the DIY kits page.",
    href: "/admin/diy-products",
    action: "Manage DIY products",
  },
  {
    title: "Extras",
    description: "Plan gift cards and loyalty cards for the extras section.",
    href: "/admin/extras",
    action: "Manage extras",
  },
];

// Gives managers a focused starting point for the website workspaces.
export function AdminDashboard({ productCount }: { productCount: number }) {
  return <AdminShell active="dashboard" productCount={productCount}>
    <header className="admin-topbar">
      <div><p className="admin-eyebrow">Workspace</p><h1>Dashboard</h1></div>
    </header>
    <section className="admin-dashboard-intro">
      <h2>Manage your core areas</h2>
      <p>Choose a workspace to maintain the parts of Get2Gether that visitors use most.</p>
    </section>
    <section className="admin-workspace-grid" aria-label="Management workspaces">
      {workspaces.map((workspace) => <article key={workspace.title} className="admin-workspace-card">
        <p className="admin-eyebrow">Workspace</p>
        <h2>{workspace.title}</h2>
        <p>{workspace.description}</p>
        <a href={workspace.href} className="admin-workspace-link">{workspace.action}<span aria-hidden="true">→</span></a>
      </article>)}
    </section>
  </AdminShell>;
}
