import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, EyeOff, FileText } from 'lucide-react';
import { fetchTools } from './actions';
import { DeleteToolButton } from '@/components/admin/tools/DeleteToolButton';

export default async function AdminToolsPage() {
  const tools = await fetchTools();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tools Management</h1>
          <p className="text-muted-foreground">
            Manage your name generator tools and their configurations.
          </p>
        </div>
        <Button asChild>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell>
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
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {tool.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {tool.ai_prompt_category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {tool.is_published ? (
                          <>
                            <Eye className="h-4 w-4 text-green-600" />
                            <Badge variant="default">Published</Badge>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">Draft</Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tool.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/tools/${tool.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" title="Manage Page Content">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
} 