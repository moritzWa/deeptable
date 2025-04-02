import { Navbar } from '@/components/navbar';
import { TableComponent } from '@/components/TableComponent';

export default function PublicTablePage() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24 h-0">
        <TableComponent />
      </main>
    </div>
  );
}
