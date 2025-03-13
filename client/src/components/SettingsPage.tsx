import { AppLayout } from "./AppLayout";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-8">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <p className="text-muted-foreground mb-4">
              Manage your account settings and preferences.
            </p>
            {/* Account settings form would go here */}
            <div className="text-sm text-muted-foreground">
              Account settings coming soon.
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">API Keys</h2>
            <p className="text-muted-foreground mb-4">
              Manage your API keys for external services.
            </p>
            {/* API key management would go here */}
            <div className="text-sm text-muted-foreground">
              API key management coming soon.
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <p className="text-muted-foreground mb-4">
              Customize your experience with Deep Table.
            </p>
            {/* Preferences form would go here */}
            <div className="text-sm text-muted-foreground">
              Preferences settings coming soon.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}