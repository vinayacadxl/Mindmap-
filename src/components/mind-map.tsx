"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  type EdgeMarkerType,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/use-auth';
import TaskNode, { type TaskData } from '@/components/task-node';
import TitleNode, { type TitleData } from '@/components/title-node';
import ImageNode, { type ImageData } from '@/components/image-node';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { suggestTasks } from '@/ai/flows/suggest-tasks';
import { Plus, Sparkles, Loader2, Type, BrainCircuit, Image as ImageIcon } from 'lucide-react';

import { UserMenu } from './user-menu';
import { ChatSidebar } from './chat-sidebar';
import { MessagesSquare } from 'lucide-react';

const nodeTypes = {
  task: TaskNode as React.FC<any>,
  title: TitleNode as React.FC<any>,
  image: ImageNode as React.FC<any>,
};


const initialNodes: Node<any>[] = [
  {
    id: 'task-1',
    type: 'task',
    position: { x: 100, y: 100 },
    data: {
      title: 'Project Kick-off',
      description: 'Double-click me to edit my content!',
      status: 'done',
      assignedTo: 'Alice',
      createdAt: '2024-03-01T10:00:00.000Z',
      dueDate: '2024-03-05T18:00:00.000Z'
    },
  },
  {
    id: 'task-2',
    type: 'task',
    position: { x: 400, y: 50 },
    data: {
      title: 'Design Phase',
      description: 'Create wireframes and mockups.',
      status: 'inprogress',
      assignedTo: 'Bob',
      createdAt: '2024-03-05T09:00:00.000Z',
      dueDate: '2024-03-15T18:00:00.000Z'
    },
  },
  {
    id: 'task-3',
    type: 'task',
    position: { x: 400, y: 250 },
    data: {
      title: 'Development',
      description: 'Use the "Add Task" button to create new tasks.',
      status: 'todo',
      createdAt: '2024-03-06T12:00:00.000Z',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'task-1', target: 'task-2' },
];

const defaultEdgeOptions: any = {
  animated: true,
  type: 'smoothstep',
  style: { strokeWidth: 2 },
  markerEnd: { type: 'arrowclosed' },
};

function MindMapComponent() {
  const [nodes, setNodes] = useState<Node<any>[]>([]);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isAiAddTaskDialogOpen, setAiAddTaskDialogOpen] = useState(false);
  const [aiAddTaskPrompt, setAiAddTaskPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { deleteElements } = useReactFlow();



  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const saveData = useCallback(async (nodesToSave: Node[], edgesToSave: Edge[]) => {
    if (!user || !isFirebaseConfigured || !db) return;
    try {
      const plainNodes = nodesToSave.map(({ data, ...node }) => {
        const { onUpdateNode, onDeleteNode, ...restData } = data;

        // Firestore doesn't support `undefined` values. We convert them to `null` before saving.
        const sanitizedData: { [key: string]: any } = {};
        for (const key in restData) {
          if (Object.prototype.hasOwnProperty.call(restData, key)) {
            const value = (restData as any)[key];
            sanitizedData[key] = value === undefined ? null : value;
          }
        }

        return { ...node, data: sanitizedData };
      });
      const userDocRef = doc(db!, 'mindmaps', user.uid);
      await setDoc(userDocRef, { nodes: plainNodes, edges: edgesToSave });
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save your mind map.',
      });
    }
  }, [user, toast]);

  const onUpdateNode = useCallback((id: string, data: Record<string, any>) => {
    const newNodes = nodesRef.current.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...data } };
      }
      return node;
    });
    setNodes(newNodes);
    saveData(newNodes, edgesRef.current);
  }, [saveData]);

  const onDeleteNode = useCallback((nodeId: string) => {
    deleteElements({ nodes: [{ id: nodeId }] });
    const nodeToRemove = nodesRef.current.find(n => n.id === nodeId);
    if (nodeToRemove) {
      toast({
        title: 'Node Removed',
        description: `"${nodeToRemove.data.title || nodeToRemove.data.label}" was deleted.`,
      });
    }
  }, [deleteElements, toast]);


  useEffect(() => {
    const loadInitialData = () => {
      const nodesWithCallback: Node<any>[] = initialNodes.map((node) => ({
        ...node,
        data: { ...node.data, onUpdateNode, onDeleteNode },
      }));
      setNodes(nodesWithCallback);
      setEdges(initialEdges);
      setIsDataLoaded(true);
    };

    if (!user || !isFirebaseConfigured || !db) {
      loadInitialData();
      return;
    }

    const loadData = async () => {
      setIsDataLoaded(false);
      const userDocRef = doc(db!, 'mindmaps', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const loadedNodes: Node<any>[] = (data.nodes || []).map((node: Node) => ({
          ...node,
          data: {
            ...node.data,
            onUpdateNode,
            onDeleteNode,
          },
        }));
        setNodes(loadedNodes);
        setEdges(data.edges || []);
      } else {
        const nodesWithCallback: Node<any>[] = initialNodes.map((node) => ({
          ...node,
          data: { ...node.data, onUpdateNode, onDeleteNode },
        }));
        setNodes(nodesWithCallback);
        setEdges(initialEdges);
        saveData(nodesWithCallback, initialEdges);
      }
      setIsDataLoaded(true);
    };

    loadData();
  }, [user, onUpdateNode, onDeleteNode, saveData]);


  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const newNodes = applyNodeChanges(changes, nodesRef.current);
    setNodes(newNodes);
    if (changes.some(c => c.type === 'remove' || c.type === 'dimensions' || (c.type === 'position' && c.dragging === false))) {
      saveData(newNodes, edgesRef.current);
    }
  }, [saveData]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const newEdges = applyEdgeChanges(changes, edgesRef.current);
    setEdges(newEdges);
    if (changes.some(c => c.type === 'remove')) {
      saveData(nodesRef.current, newEdges);
    }
  }, [saveData]);

  const onConnect = useCallback((params: Connection) => {
    const newEdges = addEdge(params, edgesRef.current);
    setEdges(newEdges);
    saveData(nodesRef.current, newEdges);
  }, [saveData]);

  const handleAddTask = useCallback(() => {
    const id = `task-${crypto.randomUUID()}`;
    const newNode: Node<TaskData> = {
      id,
      type: 'task',
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        title: 'New Task',
        description: '',
        status: 'todo',
        createdAt: new Date().toISOString(),
        onUpdateNode,
        onDeleteNode,
      },
    };
    const newNodes = nodesRef.current.concat(newNode);
    setNodes(newNodes);
    saveData(newNodes, edgesRef.current);
  }, [onUpdateNode, onDeleteNode, saveData]);

  const handleAddTitle = useCallback(() => {
    const id = `title-${crypto.randomUUID()}`;
    const newNode: Node<TitleData> = {
      id,
      type: 'title',
      position: {
        x: Math.random() * 200,
        y: Math.random() * 200,
      },
      data: {
        label: 'Floating Title',
        fontSize: 28,
        onUpdateNode,
        onDeleteNode,
      },
    };
    const newNodes = nodesRef.current.concat(newNode);
    setNodes(newNodes);
    saveData(newNodes, edgesRef.current);
  }, [onUpdateNode, onDeleteNode, saveData]);

  const addImageNode = useCallback((imageUrl: string, label?: string) => {
    const id = `image-${crypto.randomUUID()}`;
    const newNode: Node<ImageData> = {
      id,
      type: 'image',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        imageUrl,
        label: label || `Pasted Image ${new Date().toLocaleTimeString()}`,
        onUpdateNode,
        onDeleteNode,
      },
    };

    // Update local state first for instant feedback
    setNodes((prev) => prev.concat(newNode));

    // Save to firebase
    const updatedNodes = nodesRef.current.concat(newNode);
    saveData(updatedNodes, edgesRef.current);

    toast({
      title: 'Image Added',
      description: 'The screenshot has been added to your mind map.',
    });
  }, [onUpdateNode, onDeleteNode, saveData, toast]);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    // Only paste if we're not in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    const items = event.clipboardData?.items;
    if (!items) return;

    let imageFound = false;
    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        imageFound = true;
        const file = item.getAsFile();
        if (!file) continue;

        toast({
          title: 'Processing Image...',
          description: 'Please wait while we add your screenshot.',
        });

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            // Check if image is too large (> 800KB) and compress if needed
            if (result.length > 800000) {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max width 1200px
                if (width > 1200) {
                  height = (1200 / width) * height;
                  width = 1200;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                // Compress to 70% quality
                const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
                addImageNode(compressedUrl, 'Compressed Screenshot');
              };
              img.src = result;
            } else {
              addImageNode(result, 'Screenshot');
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, [addImageNode, toast]);

  // Use a more robust listener approach
  useEffect(() => {
    const onGlobalPaste = (e: Event) => handlePaste(e as ClipboardEvent);
    document.addEventListener('paste', onGlobalPaste);
    return () => document.removeEventListener('paste', onGlobalPaste);
  }, [handlePaste]);



  const handleWorkflowGenerated = useCallback((workflow: { tasks?: any[], edges?: any[] }) => {
    if (!workflow) return;

    const tasks = Array.isArray(workflow.tasks) ? workflow.tasks : [];
    const rawEdges = Array.isArray(workflow.edges) ? workflow.edges : [];

    // Build remapping table: AI task id → fresh UUID (prevents collisions with existing nodes)
    const idMap: Record<string, string> = {};
    tasks.forEach(task => {
      idMap[task.id || ''] = `task-${crypto.randomUUID()}`;
    });

    const newNodes: Node<TaskData>[] = tasks.map(task => ({
      id: idMap[task.id || ''] || `task-${crypto.randomUUID()}`,
      type: 'task',
      position: task.position || { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
      data: {
        title: task.title || 'Untitled Task',
        description: task.description || '',
        status: 'todo',
        createdAt: new Date().toISOString(),
        onUpdateNode,
        onDeleteNode,
      },
    }));

    const newEdges: Edge[] = rawEdges.map(edge => ({
      // Always use a fresh UUID for edge IDs — never trust AI-generated IDs
      id: `edge-${crypto.randomUUID()}`,
      source: idMap[edge.source] || edge.source,
      target: idMap[edge.target] || edge.target,
      label: edge.label,
      animated: true,
      type: 'smoothstep',
    }));

    const updatedNodes = nodesRef.current.concat(newNodes);
    const updatedEdges = edgesRef.current.concat(newEdges);

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    saveData(updatedNodes, updatedEdges);
    setIsChatOpen(false);
  }, [onUpdateNode, onDeleteNode, saveData]);

  const handleOpenAiAddTaskDialog = useCallback(() => {
    setAiAddTaskPrompt('');
    setAiAddTaskDialogOpen(true);
  }, []);

  const handleSuggestTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await suggestTasks({ prompt: aiAddTaskPrompt });

      const newNodes: Node<TaskData>[] = result.tasks.map(task => {
        const id = `task-${crypto.randomUUID()}`;
        return {
          id,
          type: 'task',
          position: {
            x: Math.random() * 500,
            y: Math.random() * 500,
          },
          data: {
            title: task.title,
            description: task.description,
            status: 'todo',
            createdAt: new Date().toISOString(),
            onUpdateNode,
            onDeleteNode,
          },
        };
      });

      if (newNodes.length > 0) {
        const updatedNodes = nodesRef.current.concat(newNodes);
        setNodes(updatedNodes);
        saveData(updatedNodes, edgesRef.current);
        toast({
          title: 'AI Tasks Added',
          description: `${newNodes.length} new tasks have been added to your mind map.`,
        });
      } else {
        toast({
          title: "AI Suggestion",
          description: "The AI didn't suggest any new tasks based on your prompt.",
        });
      }

      setAiAddTaskDialogOpen(false);
    } catch (error) {
      console.error('AI task suggestion failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get AI task suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [aiAddTaskPrompt, onUpdateNode, onDeleteNode, saveData, toast]);


  if (!isDataLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-card/90 backdrop-blur-xl border-b border-border shrink-0 z-10 shadow-sm">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <BrainCircuit className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">MindTask<span className="text-primary">Navigator</span></h1>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button onClick={handleAddTitle} size="sm" variant="outline">
              <Type className="mr-2" />
              Add Title
            </Button>
            <Button onClick={handleAddTask} size="sm" variant="outline">
              <Plus className="mr-2" />
              Add Task
            </Button>


            <Button onClick={handleOpenAiAddTaskDialog} size="sm">
              <Sparkles className="mr-2" />
              AI Tasks
            </Button>
            <Button onClick={() => setIsChatOpen(true)} size="sm" variant="outline" className="rounded-full shadow-sm">
              <MessagesSquare className="h-4 w-4" />
            </Button>
          </div>
          <UserMenu />
        </div>
      </header>
      <main className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          className="bg-transparent"
        >
          <Controls className="!bg-card !border-border shadow-xl rounded-2xl overflow-hidden [&_button]:!bg-card [&_button]:!border-border [&_button]:!text-foreground" />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            style={{ background: 'hsl(var(--card))' }}
            className="!border-border shadow-2xl rounded-[2rem] overflow-hidden"
          />
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(var(--border))" />
        </ReactFlow>
      </main>

      <Dialog open={isAiAddTaskDialogOpen} onOpenChange={setAiAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>AI-Powered Task Generation</DialogTitle>
            <DialogDescription>
              Describe your goal, and the AI will break it down into tasks for you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={aiAddTaskPrompt}
              onChange={(e) => setAiAddTaskPrompt(e.target.value)}
              className="min-h-[100px]"
              placeholder="e.g., Launch a new weekly podcast"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiAddTaskDialogOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSuggestTasks} disabled={isLoading || !aiAddTaskPrompt}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <BrainCircuit className="mr-2" />}
              Generate Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onWorkflowGenerated={handleWorkflowGenerated}
      />
    </div>
  );
}


export default function MindMap() {
  return (
    <ReactFlowProvider>
      <MindMapComponent />
    </ReactFlowProvider>
  );
}
