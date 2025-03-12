import { zodResolver } from "@hookform/resolvers/zod";
import { Octokit } from "@octokit/core";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormData } from "../scraping-logic/relatedDevelopersScraper";
import { FormPreferences, LanguageKeys } from "../types";
import { trpc } from "../utils/trpc";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ScraperFormProps {
  onSubmit: (formData: FormData, owner: string, repo: string, mode: string) => void;
  isLoading: boolean;
  onOctokitUpdate: (octokit: Octokit) => void;
}

const formSchema = z.object({
  api_key: z.string().optional(),
  target_repo: z.string().url({ message: "Please enter a valid URL" }),
  target_mode: z.enum(["stargazers", "forks", "watchers", "contributors"]),
  repos: z.number().min(0).default(10),
  langJS: z.boolean().default(true),
  langTS: z.boolean().default(true),
  langPython: z.boolean().default(false),
  langGo: z.boolean().default(false),
  langRust: z.boolean().default(false),
  langCpp: z.boolean().default(false),
  langPerc: z.number().min(0).max(100).default(35),
  followers: z.number().min(0).default(15),
  following: z.number().min(0).default(0),
  account_created: z.number().min(0).default(4),
  repo_updated: z.number().min(0).default(1),
})

type FormValues = z.infer<typeof formSchema>

interface LanguageOption {
  id: LanguageKeys;
  label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'langJS', label: 'JavaScript' },
  { id: 'langTS', label: 'TypeScript' },
  { id: 'langPython', label: 'Python' },
  { id: 'langGo', label: 'Go' },
  { id: 'langRust', label: 'Rust' },
  { id: 'langCpp', label: 'C++' },
];

export const RelatedDevelopersScraperForm: React.FC<ScraperFormProps> = ({ 
  onSubmit, 
  isLoading,
  onOctokitUpdate 
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target_mode: "stargazers",
      repos: 10,
      langJS: true,
      langTS: true,
      langPython: false,
      langGo: false,
      langRust: false,
      langCpp: false,
      langPerc: 35,
      followers: 15,
      following: 0,
      account_created: 4,
      repo_updated: 1,
    }
  });

  // Get user data including form preferences
  const { data: userData } = trpc.auth.getUser.useQuery(
    { token: localStorage.getItem('token') || '' },
    { enabled: !!localStorage.getItem('token') }
  );

  // Update form preferences mutation
  const updatePreferences = trpc.auth.updateFormPreferences.useMutation();

  // Load saved preferences when user data is available
  useEffect(() => {
    if (userData?.formPreferences) {
      const preferences = userData.formPreferences as FormPreferences;
      const defaultValues = form.getValues();

      form.reset({
        ...defaultValues,
        api_key: preferences.apiKey || defaultValues.api_key,
        target_repo: preferences.repositoryUrl || defaultValues.target_repo || '',
        target_mode: preferences.target_mode || defaultValues.target_mode || 'stargazers',
        repos: preferences.repos || defaultValues.repos,
        langJS: preferences.langJS ?? defaultValues.langJS,
        langTS: preferences.langTS ?? defaultValues.langTS,
        langPython: preferences.langPython ?? defaultValues.langPython,
        langGo: preferences.langGo ?? defaultValues.langGo,
        langRust: preferences.langRust ?? defaultValues.langRust,
        langCpp: preferences.langCpp ?? defaultValues.langCpp,
        langPerc: preferences.langPerc || defaultValues.langPerc,
        followers: preferences.followers || defaultValues.followers,
        following: preferences.following || defaultValues.following,
        account_created: preferences.account_created || defaultValues.account_created,
        repo_updated: preferences.repo_updated || defaultValues.repo_updated,
      });

      if (preferences.apiKey) {
        onOctokitUpdate(
          new Octokit({
            auth: preferences.apiKey,
          })
        );
      }
    }
  }, [userData?.formPreferences]);

  // Save form values when they change
  const handleFormChange = async (values: FormValues) => {
    if (!localStorage.getItem('token')) return;

    try {
      // Create preferences without target_mode to avoid type error
      const formPreferences = {
        apiKey: values.api_key,
        repositoryUrl: values.target_repo,
        repos: values.repos,
        langJS: values.langJS,
        langTS: values.langTS,
        langPython: values.langPython,
        langGo: values.langGo,
        langRust: values.langRust,
        langCpp: values.langCpp,
        langPerc: values.langPerc,
        followers: values.followers,
        following: values.following,
        account_created: values.account_created,
        repo_updated: values.repo_updated,
      } as const;

      await updatePreferences.mutateAsync({
        token: localStorage.getItem('token') || '',
        formPreferences
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleSubmit = (values: FormValues) => {
    // Save form values
    handleFormChange(values);

    const formData: FormData = {
      langJS: { checked: values.langJS },
      langTS: { checked: values.langTS },
      langPython: { checked: values.langPython },
      langGo: { checked: values.langGo },
      langRust: { checked: values.langRust },
      langCpp: { checked: values.langCpp },
      repos: { value: values.repos },
      followers: { value: values.followers },
      following: { value: values.following },
      account_created: { value: values.account_created },
      repo_updated: { value: values.repo_updated },
      langPerc: { value: values.langPerc },
    };

    const repoUrl = values.target_repo;
    const repoAry = repoUrl.split("/");
    const mode = repoAry.includes("stargazers")
      ? "stargazers"
      : values.target_mode;

    let repo = repoAry.pop() || "";
    if (repo === "") repo = repoAry.pop() || "";
    const owner = repoAry.pop() || "";

    if (values.api_key) {
      onOctokitUpdate(
        new Octokit({
          auth: values.api_key,
        })
      );
    }

    onSubmit(formData, owner, repo, mode);
  };

  const anyLanguageSelected = form.watch(['langJS', 'langTS', 'langPython', 'langGo', 'langRust', 'langCpp']).some(value => value);

  return (
    <div className="w-full max-w-2xl">
      <p className="text-md text-muted-foreground mb-8">Find developers who have shown interest in or contributed to similar projects through stars, forks, subscribers, and contributions.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub API Key</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="GitHub API key" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleFormChange({
                        ...form.getValues(),
                        api_key: e.target.value
                      });
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Create a <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-300 hover:underline">GitHub token</a> with read permissions: 1. Public Repositories (read), 2. Users (read).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_repo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Repository</FormLabel>
                <FormControl>
                  <Input placeholder="Target repo url" required {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFormChange({
                        ...form.getValues(),
                        target_repo: e.target.value
                      });
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Scrape engineers that interacted with a specific repository. You can pick a repo that is similar to your codebase or one that overlaps with the tech/skills you are looking for. More advice on finding good sourcing repos <a href='/blog/finding-good-sourcing-repos' className="text-blue-500 dark:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">here</a>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Criteria heading */}
          <div className="text-lg font-bold mb-2">Criteria</div>
          <FormField
            control={form.control}
            name="target_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFormChange({
                        ...form.getValues(),
                        target_mode: value as "stargazers" | "forks" | "watchers" | "contributors"
                      });
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stargazers">Stargazers</SelectItem>
                      <SelectItem value="forks">Forkers</SelectItem>
                      <SelectItem value="watchers">Watchers</SelectItem>
                      <SelectItem value="contributors">Contributors</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No of Repositories (greater than)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => {
                      const value = e.target.valueAsNumber;
                      field.onChange(value);
                      handleFormChange({
                        ...form.getValues(),
                        repos: value
                      });
                    }} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Languages</FormLabel>
            <div className="grid grid-cols-2 gap-4">
              {LANGUAGE_OPTIONS.map((lang) => (
                <FormField
                  key={lang.id}
                  control={form.control}
                  name={lang.id as keyof FormValues}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value as boolean}
                          onCheckedChange={checked => {
                            field.onChange(checked);
                            const values = form.getValues();
                            handleFormChange({
                              ...values,
                              [lang.id]: !!checked
                            });
                          }} 
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">{lang.label}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormDescription>
              Select at least one language to analyze repositories. If no languages are selected, repository analysis will be skipped to reduce API calls and speed up the search.
            </FormDescription>
          </div>

          <FormField
            control={form.control}
            name="langPerc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percentage of language repo (greater than or equal to)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    disabled={!anyLanguageSelected}
                    onChange={e => {
                      const value = e.target.valueAsNumber;
                      field.onChange(value);
                      handleFormChange({
                        ...form.getValues(),
                        langPerc: value
                      });
                    }} 
                  />
                </FormControl>
                <FormDescription>
                  {anyLanguageSelected 
                    ? "Developers will be included if at least one selected language makes up this percentage or more of their repositories."
                    : "Select at least one language above to enable this filter."
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="followers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No of Followers (greater than)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => {
                      const value = e.target.valueAsNumber;
                      field.onChange(value);
                      handleFormChange({
                        ...form.getValues(),
                        followers: value
                      });
                    }} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="following"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No of Following (greater than)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => {
                      const value = e.target.valueAsNumber;
                      field.onChange(value);
                      handleFormChange({
                        ...form.getValues(),
                        following: value
                      });
                    }} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="account_created"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account created before (year)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    step={1} 
                    {...field} 
                    onChange={e => {
                      const value = e.target.valueAsNumber;
                      field.onChange(value);
                      handleFormChange({
                        ...form.getValues(),
                        account_created: value
                      });
                    }} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repo_updated"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repo updated within (year)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    step={1} 
                    {...field} 
                    onChange={e => {
                      const value = e.target.valueAsNumber;
                      field.onChange(value);
                      handleFormChange({
                        ...form.getValues(),
                        repo_updated: value
                      });
                    }} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>
      </Form>
    </div>
  );
}; 