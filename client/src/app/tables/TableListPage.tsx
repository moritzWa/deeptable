import { trpc } from '@/utils/trpc';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function TablesListPage() {
  const { data: tables, isLoading } = trpc.tables.getPublicTables.useQuery();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b pb-8">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Public Tables - Deep Table</title>
        <meta name="description" content="Browse our collection of public data tables" />
        <meta property="og:title" content="Public Tables - Deep Table" />
        <meta property="og:description" content="Browse our collection of public data tables" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/tables`} />
      </Helmet>

      <h1 className="text-4xl font-bold mb-8">Public Tables</h1>

      <div className="space-y-8">
        {tables?.map((table) => (
          <article key={table.id} className="border-b pb-8">
            <Link to={`/t/${table.slug}`} className="group">
              <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600">
                {table.name}
              </h2>
              <p className="text-gray-600 mb-2">{table.description}</p>
              <div className="text-sm text-gray-500">
                <time>{new Date(table.updatedAt).toLocaleDateString()}</time> •{' '}
                <span>{table.columns.length} columns</span>
              </div>
            </Link>
          </article>
        ))}

        {tables?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No public tables available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
