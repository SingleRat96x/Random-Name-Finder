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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Models</h1>
          <p className="text-muted-foreground">
            Manage AI models available for name generation tools.
          </p>
        </div>
        
        <Button asChild>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{model.display_name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {model.model_identifier}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">{model.provider_name}</Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities_tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
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
                    
                    <TableCell>
                      <Badge variant={model.is_active ? 'default' : 'secondary'}>
                        {model.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
} 