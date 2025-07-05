"use client";

import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Circle, Clock, CheckCircle, X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export type TaskData = {
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo?: string;
  dueDate?: string; // ISO string
  createdAt?: string; // ISO string
  onUpdateNode: (id: string, data: Record<string, any>) => void;
  onDeleteNode: (id: string) => void;
};

const statusConfig: Record<TaskStatus, { label: string; textClass: string; borderClass: string; icon: React.FC<any> }> = {
  todo: { label: 'To Do', textClass: 'text-muted-foreground', borderClass: 'border-muted-foreground', icon: Circle },
  inprogress: { label: 'In Progress', textClass: 'text-accent', borderClass: 'border-accent', icon: Clock },
  done: { label: 'Done', textClass: 'text-primary', borderClass: 'border-primary', icon: CheckCircle },
};

const TaskNode = ({ id, data, selected }: NodeProps<TaskData>) => {
  const { title, description, status, assignedTo, dueDate, createdAt, onUpdateNode, onDeleteNode } = data;
  const config = statusConfig[status];

  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentAssignedTo, setCurrentAssignedTo] = useState(assignedTo);
  const [currentDueDate, setCurrentDueDate] = useState(dueDate);
  const [currentCreatedAt, setCurrentCreatedAt] = useState(createdAt);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!currentDueDate || !currentCreatedAt) {
      setProgress(null);
      return;
    }

    const calculateProgress = () => {
      const now = new Date().getTime();
      const start = new Date(currentCreatedAt).getTime();
      const end = new Date(currentDueDate).getTime();

      if (end <= start) {
        setProgress(now >= end ? 100 : 0);
        return;
      }
      
      if (now >= end) {
        setProgress(100);
        return;
      }
      if (now <= start) {
        setProgress(0);
        return;
      }
      
      const percentage = ((now - start) / (end - start)) * 100;
      setProgress(Math.max(0, Math.min(100, percentage)));
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentCreatedAt, currentDueDate]);

  useEffect(() => {
    if (!isEditing) {
      setCurrentTitle(title);
      setCurrentDescription(description);
      setCurrentAssignedTo(assignedTo);
      setCurrentDueDate(dueDate);
      setCurrentCreatedAt(createdAt);
    }
  }, [title, description, assignedTo, dueDate, createdAt, isEditing]);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const commitChanges = useCallback(() => {
    if (title !== currentTitle || description !== currentDescription || assignedTo !== currentAssignedTo || dueDate !== currentDueDate || createdAt !== currentCreatedAt) {
        onUpdateNode(id, { 
          title: currentTitle, 
          description: currentDescription,
          assignedTo: currentAssignedTo,
          dueDate: currentDueDate,
          createdAt: currentCreatedAt,
        });
    }
    setIsEditing(false);
  }, [id, onUpdateNode, title, currentTitle, description, currentDescription, assignedTo, currentAssignedTo, dueDate, currentDueDate, createdAt, currentCreatedAt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          commitChanges();
      }
      if (e.key === 'Escape') {
          setCurrentTitle(title);
          setCurrentDescription(description);
          setCurrentAssignedTo(assignedTo);
          setCurrentDueDate(dueDate);
          setCurrentCreatedAt(createdAt);
          setIsEditing(false);
      }
  }

  const handleStatusChange = useCallback(
    (newStatus: TaskStatus) => {
      onUpdateNode(id, { status: newStatus });
    },
    [id, onUpdateNode]
  );
  
  const handleStartDateSelect = (date: Date | undefined) => {
    setCurrentCreatedAt(date ? date.toISOString() : undefined);
  };
  
  const handleDueDateSelect = (date: Date | undefined) => {
    setCurrentDueDate(date ? date.toISOString() : undefined);
  };

  return (
    <Card 
      className={cn(
        "group relative w-72 rounded-lg border-2 shadow-lg transition-all duration-300",
        "bg-card/80 backdrop-blur-sm",
        config.borderClass,
        selected ? 'shadow-primary/40 shadow-2xl' : 'hover:shadow-2xl hover:shadow-primary/20'
      )}
      onDoubleClick={handleDoubleClick}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteNode(id); }}
        className="absolute top-1 right-1 z-10 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
        aria-label="Delete task"
      >
        <X className="h-4 w-4" />
      </button>

      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-4">
        <config.icon className={cn("h-5 w-5 shrink-0", config.textClass)} />
        {isEditing ? (
            <Input
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-auto border-none bg-transparent px-0 text-lg font-bold focus-visible:ring-0"
              aria-label="Task title"
              autoFocus
            />
        ) : (
            <div className="text-lg font-bold truncate flex-1 transition-colors duration-300 group-hover:text-primary">{title}</div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {isEditing ? (
            <div className="space-y-2">
                <Textarea
                    value={currentDescription}
                    onChange={(e) => setCurrentDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Description..."
                    className="h-auto border-none bg-transparent px-0 text-sm text-muted-foreground focus-visible:ring-0"
                    aria-label="Task description"
                />
                <Input
                    value={currentAssignedTo || ''}
                    onChange={(e) => setCurrentAssignedTo(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Assign to..."
                    className="h-auto border-none bg-transparent px-0 text-sm focus-visible:ring-0"
                    aria-label="Assignee"
                />
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !currentCreatedAt && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {currentCreatedAt ? `Start: ${format(new Date(currentCreatedAt), "PPP")}` : <span>Pick a start date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={currentCreatedAt ? new Date(currentCreatedAt) : undefined}
                            onSelect={handleStartDateSelect}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !currentDueDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {currentDueDate ? `Due: ${format(new Date(currentDueDate), "PPP")}`: <span>Pick a due date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={currentDueDate ? new Date(currentDueDate) : undefined}
                            onSelect={handleDueDateSelect}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <Button onClick={commitChanges} size="sm" className="w-full mt-2">
                  <Check className="mr-2 h-4 w-4" />
                  Done
                </Button>
            </div>
        ) : (
            <>
                <p className="text-sm text-muted-foreground min-h-[20px] max-h-6 overflow-hidden transition-all duration-300 ease-in-out group-hover:max-h-48">{description || "No description"}</p>
                {progress !== null && createdAt && dueDate && (
                    <div className="space-y-1 pt-2">
                         <Progress value={progress} className="h-2 w-full" />
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{format(new Date(createdAt), "PP")}</span>
                            <span>{format(new Date(dueDate), "PP")}</span>
                         </div>
                          <p className="text-right text-xs font-semibold text-muted-foreground">
                            {status === 'done' ? 'Completed' : progress >= 100 ? 'Overdue' : `${(100 - progress).toFixed(0)}% time remaining`}
                         </p>
                    </div>
                )}
            </>
        )}
        <div className="flex items-center justify-between pt-2">
            {!isEditing && assignedTo ? (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback>{assignedTo.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-muted-foreground">{assignedTo}</span>
                </div>
            ) : <div />}
            <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="Set status" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key as TaskStatus}>
                    <div className="flex items-center gap-2">
                    <config.icon className={cn('h-4 w-4', config.textClass)} />
                    <span>{config.label}</span>
                    </div>
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </CardContent>
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </Card>
  );
};

export default memo(TaskNode);
