/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Code, Settings, Type, Hash, ToggleLeft, List, Sparkles, X, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

interface ConfigurableFieldsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentationSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function ConfigurableFieldsGuideModal({ isOpen, onClose }: ConfigurableFieldsGuideModalProps) {
  const [activeSectionId, setActiveSectionId] = useState('intro');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const sections: DocumentationSection[] = [
    {
      id: 'intro',
      title: 'Introduction',
      icon: <BookOpen className="h-4 w-4" />,
      content: <IntroContent />
    },
    {
      id: 'tool-category',
      title: 'Tool Category',
      icon: <Settings className="h-4 w-4" />,
      content: <ToolCategoryContent />
    },
    {
      id: 'general',
      title: 'General Properties',
      icon: <Settings className="h-4 w-4" />,
      content: <GeneralPropertiesContent />
    },
    {
      id: 'text',
      title: 'Text Input',
      icon: <Type className="h-4 w-4" />,
      content: <TextInputContent />
    },
    {
      id: 'textarea',
      title: 'Textarea',
      icon: <Type className="h-4 w-4" />,
      content: <TextareaContent />
    },
    {
      id: 'select',
      title: 'Select Dropdown',
      icon: <List className="h-4 w-4" />,
      content: <SelectDropdownContent />
    },
    {
      id: 'number',
      title: 'Number Input',
      icon: <Hash className="h-4 w-4" />,
      content: <NumberInputContent />
    },
    {
      id: 'switch',
      title: 'Switch/Checkbox',
      icon: <ToggleLeft className="h-4 w-4" />,
      content: <SwitchContent />
    },
    {
      id: 'special-keyword',
      title: 'Special: Keyword',
      icon: <Sparkles className="h-4 w-4" />,
      content: <SpecialKeywordContent />
    },
    {
      id: 'special-length',
      title: 'Special: Name Length',
      icon: <Sparkles className="h-4 w-4" />,
      content: <SpecialLengthContent />
    },
    {
      id: 'example',
      title: 'Complete Example',
      icon: <Code className="h-4 w-4" />,
      content: <CompleteExampleContent />
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: <BookOpen className="h-4 w-4" />,
      content: <TipsContent />
    }
  ];

  const activeSection = sections.find(s => s.id === activeSectionId);
  const activeSectionIndex = sections.findIndex(s => s.id === activeSectionId);
  const canGoBack = activeSectionIndex > 0;
  const canGoForward = activeSectionIndex < sections.length - 1;

  const goToPreviousSection = () => {
    if (canGoBack) {
      setActiveSectionId(sections[activeSectionIndex - 1].id);
    }
  };

  const goToNextSection = () => {
    if (canGoForward) {
      setActiveSectionId(sections[activeSectionIndex + 1].id);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setIsMobileSidebarOpen(false); // Close mobile sidebar when section is selected
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-none lg:w-[85vw] lg:h-[90vh] lg:max-w-[85vw] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Code className="h-5 w-5" />
            <span>Configurable Fields Documentation</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Complete guide for structuring configurable_fields JSON when creating or editing tools
          </DialogDescription>
        </DialogHeader>
        
        {/* Mobile Header with Section Selector */}
        <div className="lg:hidden px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <Select value={activeSectionId} onValueChange={handleSectionChange}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    <div className="flex items-center space-x-2">
                      {section.icon}
                      <span>{section.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="px-3"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            lg:w-1/4 lg:border-r lg:border-border lg:static lg:translate-x-0
            ${isMobileSidebarOpen 
              ? 'fixed inset-y-0 left-0 w-80 bg-background border-r border-border z-50 transform translate-x-0' 
              : 'hidden lg:block'
            }
          `}>
            <div className="lg:hidden p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Sections</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-full p-4">
              <div className="space-y-1">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSectionId === section.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left text-sm"
                    onClick={() => handleSectionChange(section.id)}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      {section.icon}
                      <span className="truncate">{section.title}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4 sm:p-6">
              <div className="max-w-none">
                {activeSection?.content}
              </div>
            </ScrollArea>
            
            {/* Mobile Navigation Footer */}
            <div className="lg:hidden border-t bg-background p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousSection}
                  disabled={!canGoBack}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  {activeSectionIndex + 1} of {sections.length}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextSection}
                  disabled={!canGoForward}
                  className="flex items-center space-x-2"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Content Components
function IntroContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">Introduction to Configurable Fields</h2>
      <p className="text-muted-foreground text-sm sm:text-base">
        Configurable fields define the user interface elements that appear on your tool&apos;s public page. 
        They allow users to customize parameters before generating names with AI.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">What are Configurable Fields?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm sm:text-base">
            Each configurable field represents an input control (text box, dropdown, switch, etc.) 
            that users can interact with on your tool&apos;s page. The values they enter are passed to 
            the AI generation system to customize the output.
          </p>
          <p className="text-sm sm:text-base">
            Fields are defined as a JSON array where each object represents one input control 
            with its properties, validation rules, and default values.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Basic Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-3 sm:p-4 rounded-md overflow-x-auto text-xs sm:text-sm">
            <code>{`[
  {
    "name": "field_name",
    "label": "Display Label",
    "type": "text|number|select|textarea|switch",
    "default": "default_value",
    "required": true|false
  }
]`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Tool Card Styling (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm sm:text-base">
            You can specify an <strong>Icon Name</strong> (from Lucide React) and an <strong>Accent Color Class</strong> 
            (Tailwind CSS classes) in the main tool settings. These will be used to give each tool card on the 
            public <code className="text-xs sm:text-sm">/tools</code> listing page a unique visual touch.
          </p>
          <p className="text-sm sm:text-base">
            For example, <code className="text-xs sm:text-sm">accent_color_class</code> could be <code className="text-xs sm:text-sm">border-t-4 border-blue-500</code> or 
            <code className="text-xs sm:text-sm">text-green-600</code> to style an icon or card element.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ToolCategoryContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">Tool Category</h2>
      <p className="text-muted-foreground text-sm sm:text-base">
        The Tool Category field helps organize and group tools on the public site for better user navigation and discovery.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">What is Tool Category?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm sm:text-base">
            The category field is a simple text input that allows you to assign a category to your tool. 
            This category will be used to group tools together on the public tools listing page, making it 
            easier for users to find tools that match their interests.
          </p>
          <p className="text-sm sm:text-base">
            Categories are stored in the <code className="text-xs sm:text-sm">tools</code> table as a text field and can be filtered 
            on the public site to help users discover related tools.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><strong>Keep it consistent:</strong> Use standardized category names to avoid fragmenting similar tools.</p>
          <p><strong>Examples of good categories:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Fantasy</strong> - For fantasy-themed names (dragons, wizards, kingdoms)</li>
            <li><strong>Sci-Fi</strong> - For science fiction names (planets, spaceships, aliens)</li>
            <li><strong>Pet Names</strong> - For animal and pet naming tools</li>
            <li><strong>Business</strong> - For company, product, and brand names</li>
            <li><strong>Character Names</strong> - For fictional character naming</li>
            <li><strong>Places</strong> - For location and geographical names</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Category field is optional - tools can exist without a category</p>
          <p>• Categories are case-sensitive, so "Fantasy" and "fantasy" are different</p>
          <p>• Use title case for consistency (e.g., "Pet Names" not "pet names")</p>
          <p>• Database includes indexes for efficient category-based filtering</p>
        </CardContent>
      </Card>
    </div>
  );
}

function GeneralPropertiesContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">General Field Properties</h2>
      <p className="text-muted-foreground">
        These properties are available for all field types and control basic behavior and appearance.
      </p>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Badge variant="secondary" className="mr-2">Required</Badge>
              name
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Type:</strong> string</p>
            <p><strong>Description:</strong> Unique identifier for the field. Used internally and in form submission.</p>
            <p><strong>Rules:</strong> Must be unique within the tool, use snake_case, no spaces or special characters.</p>
            <pre className="bg-muted p-2 rounded mt-2">
              <code>"name": "tone"</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Badge variant="secondary" className="mr-2">Required</Badge>
              label
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Type:</strong> string</p>
            <p><strong>Description:</strong> Human-readable label displayed to users above the input field.</p>
            <pre className="bg-muted p-2 rounded mt-2">
              <code>"label": "Tone"</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Badge variant="secondary" className="mr-2">Required</Badge>
              type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Type:</strong> string</p>
            <p><strong>Options:</strong> &quot;text&quot;, &quot;number&quot;, &quot;select&quot;, &quot;textarea&quot;, &quot;switch&quot;</p>
            <p><strong>Description:</strong> Determines what type of input control is rendered.</p>
            <pre className="bg-muted p-2 rounded mt-2">
              <code>"type": "select"</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Badge variant="outline" className="mr-2">Optional</Badge>
              default
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Type:</strong> any (depends on field type)</p>
            <p><strong>Description:</strong> Default value when the form loads. Type should match the field type.</p>
            <pre className="bg-muted p-2 rounded mt-2">
              <code>"default": "playful"</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Badge variant="outline" className="mr-2">Optional</Badge>
              required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Type:</strong> boolean</p>
            <p><strong>Default:</strong> false</p>
            <p><strong>Description:</strong> Whether the field must be filled before form submission.</p>
            <pre className="bg-muted p-2 rounded mt-2">
              <code>"required": true</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Badge variant="outline" className="mr-2">Optional</Badge>
              placeholder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Type:</strong> string</p>
            <p><strong>Description:</strong> Placeholder text shown in empty input fields (text, textarea, number types).</p>
            <pre className="bg-muted p-2 rounded mt-2">
              <code>"placeholder": "Enter a theme or keyword..."</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Badge variant="outline" className="mr-2">Optional</Badge>
              layout_span_all_columns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Type:</strong> boolean</p>
            <p><strong>Default:</strong> false</p>
            <p><strong>Description:</strong> Controls field layout in the form's responsive two-column grid.</p>
            <div className="space-y-3 mt-3">
              <p>
                The tool input form uses a responsive two-column grid on wider screens. By default, each field occupies one column. 
                To make a field span both columns (e.g., for a textarea or a field that needs more horizontal space), 
                set this property to <code>true</code>.
              </p>
              <p><strong>Example:</strong></p>
              <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                <code>{`{
  "name": "long_description_field",
  "label": "Detailed Description",
  "type": "textarea",
  "layout_span_all_columns": true
}`}</code>
              </pre>
              <p className="text-sm text-muted-foreground">
                Setting <code>"layout_span_all_columns": true</code> will make the field take up the full width available 
                in the form's grid on medium screens and up. On smaller screens, all fields stack into a single column automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TextInputContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Text Input Field</h2>
      <p className="text-muted-foreground">
        Single-line text input for short text values like keywords, themes, or names.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Text Field</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`{
  "name": "theme",
  "label": "Theme",
  "type": "text",
  "placeholder": "e.g., Medieval, Space, Nature",
  "required": false,
  "default": ""
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Keywords or themes to include in generated names</p>
          <p>• Prefixes or suffixes for names</p>
          <p>• Short descriptive text</p>
          <p>• User preferences in text form</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>All general properties plus:</strong></p>
          <p>• <code>placeholder</code> - Hint text shown when field is empty</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TextareaContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Textarea Field</h2>
      <p className="text-muted-foreground">
        Multi-line text input for longer text content like descriptions or detailed instructions.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Textarea Field</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`{
  "name": "description",
  "label": "Character Description",
  "type": "textarea",
  "placeholder": "Describe the character&apos;s personality, background, or traits...",
  "required": false,
  "default": ""
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Detailed character descriptions</p>
          <p>• Story context or background</p>
          <p>• Multiple keywords or requirements</p>
          <p>• User instructions for AI generation</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>All general properties plus:</strong></p>
          <p>• <code>placeholder</code> - Hint text shown when field is empty</p>
          <p>• Automatically renders as a resizable multi-line input</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SelectDropdownContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Select Dropdown Field</h2>
      <p className="text-muted-foreground">
        Dropdown menu allowing users to choose from predefined options.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Select Field</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`{
  "name": "tone",
  "label": "Tone",
  "type": "select",
  "options": ["playful", "mysterious", "regal", "cute"],
  "default": "playful",
  "required": true
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>options</strong> (array of strings): List of available choices</p>
          <pre className="bg-muted p-2 rounded mt-2">
            <code>"options": ["option1", "option2", "option3"]</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Example with More Options</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`{
  "name": "genre",
  "label": "Genre",
  "type": "select",
  "options": [
    "fantasy",
    "sci-fi",
    "modern",
    "historical",
    "mythological",
    "steampunk"
  ],
  "default": "fantasy",
  "required": false
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Tone or style selection (playful, serious, mysterious)</p>
          <p>• Genre categories (fantasy, sci-fi, modern)</p>
          <p>• Difficulty levels (easy, medium, hard)</p>
          <p>• Any predefined categorical choice</p>
        </CardContent>
      </Card>
    </div>
  );
}

function NumberInputContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Number Input Field</h2>
      <p className="text-muted-foreground">
        Numeric input with optional minimum and maximum value constraints.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Number Field</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`{
  "name": "count",
  "label": "Number of Names",
  "type": "number",
  "min": 1,
  "max": 50,
  "default": 10,
  "required": true
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p><strong>min</strong> (number, optional): Minimum allowed value</p>
            <pre className="bg-muted p-2 rounded mt-1">
              <code>"min": 1</code>
            </pre>
          </div>
          <div>
            <p><strong>max</strong> (number, optional): Maximum allowed value</p>
            <pre className="bg-muted p-2 rounded mt-1">
              <code>"max": 100</code>
            </pre>
          </div>
          <div>
            <p><strong>placeholder</strong> (string, optional): Hint text for empty field</p>
            <pre className="bg-muted p-2 rounded mt-1">
              <code>"placeholder": "Enter a number between 1-50"</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Number of names to generate</p>
          <p>• Character limits or lengths</p>
          <p>• Quantity or count settings</p>
          <p>• Numeric preferences or thresholds</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Example with Constraints</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`{
  "name": "max_length",
  "label": "Maximum Name Length",
  "type": "number",
  "min": 3,
  "max": 20,
  "default": 12,
  "placeholder": "3-20 characters",
  "required": false
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function SwitchContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Switch/Checkbox Field</h2>
      <p className="text-muted-foreground">
        Boolean toggle for true/false or on/off options.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Switch Field</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`{
  "name": "include_surnames",
  "label": "Include Surnames",
  "type": "switch",
  "default": false,
  "required": false
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Default Values</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>default</strong> should be a boolean value:</p>
          <pre className="bg-muted p-2 rounded mt-2">
            <code>"default": true   // Switch starts in "on" position</code>
          </pre>
          <pre className="bg-muted p-2 rounded mt-2">
            <code>"default": false  // Switch starts in "off" position</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Include/exclude certain types of names</p>
          <p>• Enable/disable special features</p>
          <p>• Toggle between different generation modes</p>
          <p>• Optional formatting or styling options</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Multiple Switch Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`[
  {
    "name": "include_titles",
    "label": "Include Titles (Mr., Dr., etc.)",
    "type": "switch",
    "default": false
  },
  {
    "name": "allow_duplicates",
    "label": "Allow Duplicate Names",
    "type": "switch",
    "default": false
  }
]`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function SpecialKeywordContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Special Field: Keyword Input</h2>
      <p className="text-muted-foreground">
        The system provides special handling for fields named "keyword" to include specific words in generated names.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Keyword Field Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`{
  "name": "keyword",
  "label": "Keyword to Include (Optional)",
  "type": "text",
  "placeholder": "e.g., Moon, Shadow, Fire",
  "required": false
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Special Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>When a field is named "keyword", the system automatically:</p>
          <p>• Adds helpful placeholder text if not specified</p>
          <p>• Includes descriptive help text below the input</p>
          <p>• Incorporates the keyword into the AI generation prompt</p>
          <p>• Handles empty values gracefully (optional by nature)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• User enters a keyword like "Moon"</p>
          <p>• AI generates names incorporating that keyword</p>
          <p>• Examples: "Moonwhisker", "Luna", "Moonbeam"</p>
          <p>• If left empty, normal generation proceeds</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Always set required: false for keyword fields</p>
          <p>• Provide helpful placeholder examples</p>
          <p>• Use clear labeling to indicate it's optional</p>
          <p>• Consider the context of your tool when naming</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SpecialLengthContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Special Field: Name Length Preference</h2>
      <p className="text-muted-foreground">
        The system provides special handling for fields named "name_length_preference" to control generated name lengths.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Name Length Field Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`{
  "name": "name_length_preference",
  "label": "Preferred Name Length",
  "type": "select",
  "options": ["Any", "Short", "Medium", "Long"],
  "default": "Any"
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Special Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>When a field is named "name_length_preference", the system automatically:</p>
          <p>• Displays descriptive labels for each option</p>
          <p>• Shows character count ranges in the dropdown</p>
          <p>• Incorporates length preferences into AI prompts</p>
          <p>• Handles the "Any" option as no preference</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Option Meanings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p><strong>"Any"</strong> - No length preference (default)</p>
          </div>
          <div>
            <p><strong>"Short"</strong> - Names around 5-8 characters</p>
            <p className="text-sm text-muted-foreground">Examples: Max, Luna, Rex, Zoe</p>
          </div>
          <div>
            <p><strong>"Medium"</strong> - Names around 8-12 characters</p>
            <p className="text-sm text-muted-foreground">Examples: Whiskers, Midnight, Sparkle</p>
          </div>
          <div>
            <p><strong>"Long"</strong> - Names 12+ characters</p>
            <p className="text-sm text-muted-foreground">Examples: Thunderstrike, Moonwhisper, Shadowdancer</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Options Array</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The options array must include these exact values for proper special handling:</p>
          <pre className="bg-muted p-2 rounded mt-2">
            <code>"options": ["Any", "Short", "Medium", "Long"]</code>
          </pre>
          <p className="text-sm text-muted-foreground mt-2">
            Note: Capitalization matters for the special behavior to work correctly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CompleteExampleContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Complete configurable_fields Example</h2>
      <p className="text-muted-foreground">
        A comprehensive example showing all field types working together for a cat name generator tool.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Full Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
            <code>{`[
  {
    "name": "tone",
    "label": "Tone",
    "type": "select",
    "options": ["playful", "mysterious", "regal", "cute"],
    "default": "playful",
    "required": true
  },
  {
    "name": "count",
    "label": "Number of Names",
    "type": "number",
    "min": 1,
    "max": 50,
    "default": 10,
    "required": true
  },
  {
    "name": "keyword",
    "label": "Keyword to Include (Optional)",
    "type": "text",
    "placeholder": "e.g., Moon, Shadow, Fire",
    "required": false
  },
  {
    "name": "name_length_preference",
    "label": "Preferred Name Length",
    "type": "select",
    "options": ["Any", "Short", "Medium", "Long"],
    "default": "Any"
  },
  {
    "name": "include_surnames",
    "label": "Include Surnames",
    "type": "switch",
    "default": false
  },
  {
    "name": "theme",
    "label": "Additional Theme",
    "type": "textarea",
    "placeholder": "Describe any additional themes or characteristics...",
    "required": false
  }
]`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What This Creates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>This configuration will generate a form with:</p>
          <p>• <strong>Tone dropdown</strong> with 4 predefined options</p>
          <p>• <strong>Number input</strong> constrained between 1-50</p>
          <p>• <strong>Keyword text field</strong> with special handling</p>
          <p>• <strong>Length preference dropdown</strong> with special labels</p>
          <p>• <strong>Surname toggle switch</strong> for additional options</p>
          <p>• <strong>Theme textarea</strong> for detailed descriptions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Based on this configuration:</p>
          <p>• Tone and count are required (form won't submit without them)</p>
          <p>• All other fields are optional</p>
          <p>• Number input enforces min/max constraints</p>
          <p>• Default values are pre-filled when form loads</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TipsContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tips & Best Practices</h2>
      <p className="text-muted-foreground">
        Guidelines for creating effective and user-friendly configurable fields.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Field Naming</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Use snake_case for field names (e.g., "name_length_preference")</p>
          <p>• Make names descriptive and unique within the tool</p>
          <p>• Avoid spaces, special characters, or starting with numbers</p>
          <p>• Use consistent naming patterns across your tools</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Provide clear, descriptive labels for all fields</p>
          <p>• Use helpful placeholder text for text inputs</p>
          <p>• Set sensible default values to minimize user effort</p>
          <p>• Only mark fields as required if absolutely necessary</p>
          <p>• Group related fields logically</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Field Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Use select dropdowns for predefined choices (3-10 options)</p>
          <p>• Use text inputs for open-ended, short responses</p>
          <p>• Use textarea for longer descriptions or multiple items</p>
          <p>• Use number inputs for quantities with clear min/max bounds</p>
          <p>• Use switches for simple on/off preferences</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Considerations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Limit the number of fields to avoid overwhelming users</p>
          <p>• Keep select option lists reasonable (under 15 options)</p>
          <p>• Use appropriate field types to enable proper validation</p>
          <p>• Consider mobile users when designing field layouts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Mistakes to Avoid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Don't use empty strings for select option values</p>
          <p>• Don't make optional fields required unnecessarily</p>
          <p>• Don't use overly technical field names or labels</p>
          <p>• Don't forget to set appropriate min/max for number fields</p>
          <p>• Don't create too many required fields (aim for 1-2 max)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Testing Your Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Test with empty/default values to ensure form works</p>
          <p>• Try edge cases (min/max values, long text, etc.)</p>
          <p>• Verify that all field types render correctly</p>
          <p>• Check that validation messages are clear</p>
          <p>• Test the complete user flow from form to results</p>
        </CardContent>
      </Card>
    </div>
  );
} 