import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, Plus, Edit } from 'lucide-react';
import { fetchAIModels } from './actions';
import { DeleteAIModelButton } from '@/components/admin/ai-models/DeleteAIModelButton';

export default async function AIModelsPage() {
  const models = await fetchAIModels();

  return (
    <div className="space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Models</h1>
          <p className="text-muted-foreground">
            Manage AI models available for name generation tools.
          </p>
        </div>
        
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/ai-models/new">
            <Plus className="h-4 w-4 mr-2" />
            Add AI Model
          </Link>
        </Button>
      </div>

      {/* AI Models Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Models ({models.length})</span>
          </CardTitle>
          <CardDescription>
            Configure and manage AI models for name generation.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {models.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No AI Models</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first AI model.
              </p>
              <Button asChild>
                <Link href="/admin/ai-models/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add AI Model
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Model</TableHead>
                    <TableHead className="min-w-[100px]">Provider</TableHead>
                    <TableHead className="min-w-[150px]">Capabilities</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="min-w-[180px]">
                        <div>
                          <div className="font-medium">{model.display_name}</div>
                          <div className="text-sm text-muted-foreground font-mono break-all">
                            {model.model_identifier}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="min-w-[100px]">
                        <Badge variant="outline" className="whitespace-nowrap">{model.provider_name}</Badge>
                      </TableCell>
                      
                      <TableCell className="min-w-[150px]">
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities_tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs whitespace-nowrap">
                              {tag}
                            </Badge>
                          ))}
                          {model.capabilities_tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{model.capabilities_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="min-w-[80px]">
                        <Badge variant={model.is_active ? 'default' : 'secondary'} className="whitespace-nowrap">
                          {model.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right min-w-[120px]">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
                            <Link href={`/admin/ai-models/${model.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          <DeleteAIModelButton modelId={model.id} modelName={model.display_name} />
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