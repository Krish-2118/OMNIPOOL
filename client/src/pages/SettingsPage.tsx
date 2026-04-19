import React from "react";
import { Link } from "react-router-dom";
import useStore from "../store/useStore";

const SettingsPage: React.FC = () => {
  const user = useStore((state) => state.user);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-hero">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-10 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Settings
            </h1>
            <p className="text-text-secondary">
              Manage account preferences and profile details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border-default bg-bg-secondary p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted mb-1">
                Name
              </p>
              <p className="text-text-primary font-medium">
                {user?.name || "Unknown"}
              </p>
            </div>
            <div className="rounded-2xl border border-border-default bg-bg-secondary p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted mb-1">
                Email
              </p>
              <p className="text-text-primary font-medium">
                {user?.email || "Unknown"}
              </p>
            </div>
            <div className="rounded-2xl border border-border-default bg-bg-secondary p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted mb-1">
                Account Type
              </p>
              <p className="text-text-primary font-medium capitalize">
                {user?.account_type || "community"}
              </p>
            </div>
            <div className="rounded-2xl border border-border-default bg-bg-secondary p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted mb-1">
                Enterprise Status
              </p>
              <p className="text-text-primary font-medium capitalize">
                {user?.enterprise_status || "none"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border-default bg-bg-secondary/60 p-5 text-sm text-text-secondary">
            This page is intentionally lightweight for now. You can return to
            the rest of the app from here.
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-bg-secondary border border-border-default text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/registry"
              className="px-4 py-2 rounded-xl bg-accent-indigo text-white hover:bg-accent-violet transition-colors"
            >
              Open Registry
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
