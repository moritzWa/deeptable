import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/utils/trpc";
import {
  Column,
  ColumnDef,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { saveAs } from "file-saver";
import { ArrowUpDown, ChevronDown, RotateCcw } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { FormData, UserProfile } from "../scraping-logic/relatedDevelopersScraper";
import { UpgradeDialog } from "./UpgradeDialog";
import { Badge } from './ui/badge';

interface ScraperResultsTableProps {
  rows: UserProfile[];
  formData: FormData;
  onOpenAllProfiles: (rows: UserProfile[]) => void;
  onCopyAllProfiles: (rows: UserProfile[]) => void;
}

interface LanguageInfo {
  key: string;
  label: string;
}

const LANGUAGE_MAP = {
  langJS: { key: 'JSpercentage', label: 'JS' },
  langTS: { key: 'TSpercentage', label: 'TS' },
  langPython: { key: 'PythonPercentage', label: 'Python' },
  langGo: { key: 'GoPercentage', label: 'Go' },
  langRust: { key: 'RustPercentage', label: 'Rust' },
  langCpp: { key: 'CppPercentage', label: 'C++' },
};

const BioTooltip = memo(({ bio }: { bio: string | null }) => {
  if (!bio) return null;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="max-w-[200px] truncate cursor-help">
          {bio}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-[400px] whitespace-normal">{bio}</p>
      </TooltipContent>
    </Tooltip>
  );
});

BioTooltip.displayName = "BioTooltip";

const LocationTooltip = memo(({ location, normalizedLocation, originalLocation }: { 
  location: string | null, 
  normalizedLocation: {
    city: string | null;
    province: string | null;
    country: string | null;
    timezone: string | null;
  },
  originalLocation: string | null 
}) => {
  const formattedLocation = useMemo(() => {
    return [
      normalizedLocation.city,
      normalizedLocation.province,
      normalizedLocation.country
    ]
      .filter(Boolean)
      .join(", ");
  }, [normalizedLocation]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="max-w-[200px] truncate cursor-help">
          {formattedLocation || location || ""}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-2">
          <p><strong>Original:</strong> {originalLocation || "N/A"}</p>
          {formattedLocation && <p><strong>Normalized:</strong> {formattedLocation}</p>}
          {normalizedLocation.timezone && <p><strong>Timezone:</strong> {normalizedLocation.timezone}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

LocationTooltip.displayName = "LocationTooltip";

const TableRowComponent = memo(({ row }: { row: any }) => {
  return (
    <TableRow key={row.id}>
      {row.getVisibleCells().map((cell: any) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
});

TableRowComponent.displayName = "TableRowComponent";

export function ScraperResultsTable({
  rows,
  formData,
  onOpenAllProfiles,
  onCopyAllProfiles,
}: ScraperResultsTableProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [usageInfo, setUsageInfo] = useState({ currentUsage: 0, limit: 0 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState(0);
  
  // Define initial column visibility state
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    name: true,
    location: true,
    company: true,
    email: true,
    avatar_url: true,
    bio: true,
    twitter_username: true,
    followers: true,
    // Hide all other columns by default
    login: false,
    languages: false,
    html_url: false,
    blog: false,
    repos_url: false,
    public_repos: false,
    public_gists: false,
    following: false,
    hireable: false,
  });

  const checkUsage = trpc.auth.checkAndIncrementExportUsage.useMutation();

  const selectedLanguages = useMemo<LanguageInfo[]>(() => {
    return Object.entries(LANGUAGE_MAP)
      .filter(([key]) => {
        const formField = formData[key as keyof FormData] as { checked: boolean };
        return formField.checked;
      })
      .map(([_, value]) => value);
  }, [formData]);

  const columns = useMemo<ColumnDef<UserProfile>[]>(() => [
    {
      accessorKey: "avatar_url",
      header: "Profile",
      cell: ({ row }: { row: Row<UserProfile> }) => {
        const profile = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url} alt={profile.login} />
              <AvatarFallback>{profile.login.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <a 
                href={profile.html_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:underline font-medium"
                onClick={(e) => handleLinkClick(e, profile.html_url)}
              >
                {profile.name || profile.login}
              </a>
              {profile.isContributor && (
                <Badge variant="secondary" className="mt-1 px-2 py-[2px] text-[10px] whitespace-nowrap">
                  {profile.contributionsCount && `${profile.contributionsCount} Contributions`}
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "login",
      header: ({ column }: { column: Column<UserProfile> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Username
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: "location",
      header: ({ column }: { column: Column<UserProfile> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Location
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: Row<UserProfile> }) => (
        <LocationTooltip 
          location={row.original.location}
          normalizedLocation={row.original.normalizedLocation}
          originalLocation={row.original.originalLocation}
        />
      ),
      enableHiding: true,
    },
    {
      accessorKey: "company",
      header: ({ column }: { column: Column<UserProfile> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: "bio",
      header: "Bio",
      cell: ({ row }: { row: Row<UserProfile> }) => <BioTooltip bio={row.getValue("bio")} />,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "twitter_username",
      header: "Twitter/X",
      cell: ({ row }: { row: Row<UserProfile> }) => row.getValue("twitter_username") ? (
        <a
          href={`https://twitter.com/${row.getValue("twitter_username")}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
          onClick={(e) => handleLinkClick(e, `https://twitter.com/${row.getValue("twitter_username")}`)}
        >
          {row.getValue("twitter_username")}
        </a>
      ) : null,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "email",
      header: ({ column }: { column: Column<UserProfile> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableHiding: true,
    },
    selectedLanguages.length > 0 ? {
      id: "languages",
      header: "Lang %",
      cell: ({ row }: { row: Row<UserProfile> }) => (
        <div className="flex flex-col whitespace-nowrap">
          {selectedLanguages.map((lang: LanguageInfo) => (
            <p key={lang.key}>{`${row.original[lang.key as keyof UserProfile]}% ${lang.label}`}</p>
          ))}
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
    } : null,
    {
      accessorKey: "html_url",
      header: "Profile",
      cell: ({ row }: { row: Row<UserProfile> }) => (
        <a 
          href={row.getValue("html_url")} 
          target="_blank" 
          rel="noreferrer"
          className="text-primary hover:underline"
          onClick={(e) => handleLinkClick(e, row.getValue("html_url"))}
        >
          {row.getValue("html_url")}
        </a>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "blog",
      header: "Blog",
      cell: ({ row }: { row: Row<UserProfile> }) => row.getValue("blog") ? (
        <a 
          href={row.getValue("blog")} 
          target="_blank" 
          rel="noreferrer"
          className="text-primary hover:underline"
          onClick={(e) => handleLinkClick(e, row.getValue("blog"))}
        >
          Blog
        </a>
      ) : null,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "repos_url",
      header: "Repositories",
      cell: ({ row }: { row: Row<UserProfile> }) => (
        <a 
          href={row.getValue("repos_url")} 
          target="_blank" 
          rel="noreferrer"
          className="text-primary hover:underline"
          onClick={(e) => handleLinkClick(e, row.getValue("repos_url"))}
        >
          Repositories
        </a>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "public_repos",
      header: ({ column }: { column: Column<UserProfile> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Public Repos #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: "public_gists",
      header: ({ column }: { column: Column<UserProfile> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Public Gists #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: "followers",
      header: ({ column }: { column: Column<UserProfile> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Followers #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: "following",
      header: ({ column }: { column: Column<UserProfile> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Following #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: "hireable",
      header: "Hireable",
      cell: ({ row }: { row: Row<UserProfile> }) => row.getValue("hireable") ? "✓" : "",
      enableSorting: false,
      enableHiding: true,
    },
  ].filter(Boolean) as ColumnDef<UserProfile>[], [selectedLanguages]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  const handleExportAction = async (action: () => void) => {

    console.log("handleExportAction incrementing");

    try {
      const result = await checkUsage.mutateAsync({
        token: localStorage.getItem('token') || '',
      });

      if (!result.canExport) {
        setUpgradeMessage(result.message || "You've reached the export/link click limit");
        setUsageInfo({
          currentUsage: result.currentUsage || 0,
          limit: result.limit || 0,
        });
        setShowUpgradeDialog(true);
        return;
      }

      action();
    } catch (error) {
      console.error('Failed to check usage:', error);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    handleExportAction(() => {
      window.open(url, '_blank');
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Username',
      'Location',
      'Company',
      'Bio',
      'Email',
      ...selectedLanguages.map((lang: LanguageInfo) => `${lang.label} %`),
      'Twitter',
      'Profile URL',
      'Blog',
      'Repositories URL',
      'Public Repos',
      'Public Gists',
      'Followers',
      'Following',
      'Hireable',
      'Avatar URL'
    ].map(header => `"${header}"`).join(',');
    
    const csvData = table.getRowModel().rows.map((row) => {
      const escapeCsv = (value: any): string => {
        const stringValue = 
          value === null || value === undefined ? "" : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      };

      return [
        escapeCsv(row.original.name),
        escapeCsv(row.original.login),
        escapeCsv(row.original.location),
        escapeCsv(row.original.company),
        escapeCsv(row.original.bio),
        escapeCsv(row.original.email),
        ...selectedLanguages.map((lang: LanguageInfo) => `${row.original[lang.key as keyof UserProfile]}`),
        escapeCsv(row.original.twitter_username),
        escapeCsv(row.original.html_url),
        escapeCsv(row.original.blog),
        escapeCsv(row.original.repos_url),
        escapeCsv(row.original.public_repos),
        escapeCsv(row.original.public_gists),
        escapeCsv(row.original.followers),
        escapeCsv(row.original.following),
        escapeCsv(row.original.hireable ? 'Yes' : 'No'),
        escapeCsv(row.original.avatar_url),
      ].join(",");
    });

    const csvContent = [headers, ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "developers.csv");
  };

  const handleOpenBatch = () => {
    const startIndex = lastViewedIndex;
    const endIndex = Math.min(startIndex + 5, rows.length);
    const batchProfiles = rows.slice(startIndex, endIndex);
    onOpenAllProfiles(batchProfiles);
    setLastViewedIndex(endIndex);
  };

  const getBatchButtonText = () => {
    const startIndex = lastViewedIndex + 1;
    const endIndex = Math.min(lastViewedIndex + 5, rows.length);
    if (lastViewedIndex >= rows.length) {
      return "All profiles viewed";
    }
    return `Click to open ${startIndex}-${endIndex}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-start gap-4">
        <Button 
          onClick={() => handleExportAction(exportToCSV)} 
          disabled={rows.length === 0}
        >
          Download CSV
        </Button>
        <Button 
          onClick={() => handleExportAction(() => onCopyAllProfiles(rows))} 
          disabled={rows.length === 0}
        >
          Copy All Profile URLs
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={() => handleExportAction(() => onOpenAllProfiles(rows))} 
              disabled={rows.length === 0}
            >
              Open all profiles
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Make sure you <i>enable Pop-ups and redirects</i> for this page</p>
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleExportAction(handleOpenBatch)}
            disabled={rows.length === 0 || lastViewedIndex >= rows.length}
          >
            {getBatchButtonText()}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLastViewedIndex(0)}
            disabled={rows.length === 0 || lastViewedIndex === 0}
            title="Reset counter"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-muted-foreground">
          {rows.length} found.
        </span>
      </div>

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        message={upgradeMessage}
        currentUsage={usageInfo.currentUsage}
        limit={usageInfo.limit}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRowComponent key={row.id} row={row} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 