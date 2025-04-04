import { Navbar } from '@/components/navbar';
import { TableComponent } from '@/components/TableComponent';
import { Button } from '@/components/ui/button';

export default function PublicTablePage() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24 h-0">
        <TableComponent isPublicView={true} />
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto pb-12">
            <h2 className="text-2xl font-semibold mb-4">Want to do more with this table?</h2>
            <p className="text-muted-foreground mb-6">
              Sign up now to add more columns to this table or AI generate a table with 100%
              accurate information in seconds.
            </p>
            <Button
              size="lg"
              onClick={() => (window.location.href = '/login?reason=edit-table-login-wall')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
