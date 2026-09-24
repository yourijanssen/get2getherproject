import { AdminShell } from "@/components/admin-shell";

const workspaces = [
  {
    title: "Pages & text",
    description: "Edit page headings, introductions, shared text and homepage images in Greek and English.",
    href: "/admin/site-content",
    action: "Edit pages & text",
  },
  {
    title: "Event listings",
    description: "Manage individual events: dates, times, posters, descriptions and publication.",
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
    title: "Extra offerings",
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
        <a href={workspace.href} className="admin-workspace-link">{workspace.action}<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></a>
      </article>)}
    </section>
  </AdminShell>;
}
