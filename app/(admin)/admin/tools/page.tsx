import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, EyeOff, FileText, ExternalLink } from 'lucide-react';
import { fetchTools } from './actions';
import { DeleteToolButton } from '@/components/admin/tools/DeleteToolButton';

export default async function AdminToolsPage() {
  const tools = await fetchTools();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tools Management</h1>
          <p className="text-muted-foreground">
            Manage your name generator tools and their configurations.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/tools/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Tool
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tools</CardTitle>
          <CardDescription>
            {tools.length} tool{tools.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tools.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No tools configured yet.</p>
              <Button asChild>
                <Link href="/admin/tools/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Tool
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[120px]">Slug</TableHead>
                    <TableHead className="min-w-[100px]">Category</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[80px]">Created</TableHead>
                    <TableHead className="text-right min-w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell className="min-w-[200px]">
                        <div>
                          <div className="font-medium">{tool.name}</div>
                          {tool.description && (
                            <div className="text-sm text-muted-foreground">
                              {tool.description.length > 60 
                                ? `${tool.description.substring(0, 60)}...` 
                                : tool.description
                              }
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                          {tool.slug}
                        </code>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {tool.ai_prompt_category}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <div className="flex items-center space-x-2">
                          {tool.is_published ? (
                            <>
                              <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <Badge variant="default" className="whitespace-nowrap">Published</Badge>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <Badge variant="outline" className="whitespace-nowrap">Draft</Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[80px]">
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(tool.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right min-w-[160px]">
                        <div className="flex items-center justify-end space-x-1">
                          <Button asChild size="sm" variant="outline" title="Open Public Page" className="flex-shrink-0">
                            <Link href={`/tools/${tool.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="flex-shrink-0">
                            <Link href={`/admin/tools/${tool.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" title="Manage Page Content" className="flex-shrink-0">
                            <Link href={`/admin/tools/${tool.id}/content`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteToolButton toolId={tool.id} toolName={tool.name} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 