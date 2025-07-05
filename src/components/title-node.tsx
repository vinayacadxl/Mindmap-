"use client";

import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export type TitleData = {
  label: string;
  fontSize: number;
  onUpdateNode: (id: string, data: Partial<Omit<TitleData, 'onUpdateNode'>>) => void;
  onDeleteNode: (id: string) => void;
};

const TitleNode = ({ id, data, selected }: NodeProps<TitleData>) => {
  const { label, fontSize, onUpdateNode, onDeleteNode } = data;
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(label);
  
  useEffect(() => {
    if (!isEditing) {
      setCurrentLabel(label);
    }
  }, [label, isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (label !== currentLabel) {
        onUpdateNode(id, { label: currentLabel });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleBlur();
      }
      if (e.key === 'Escape') {
          setCurrentLabel(label);
          setIsEditing(false);
      }
  }

  const handleFontSizeChange = (value: number[]) => {
    onUpdateNode(id, { fontSize: value[0] });
  };

  return (
    <div 
        className={cn(
            "group relative rounded-lg p-2 transition-all duration-300",
            selected && "bg-primary/10 ring-2 ring-primary"
        )}
        onDoubleClick={handleDoubleClick}
    >
        {selected && (
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteNode(id); }}
                className="absolute -top-2 -right-2 z-10 nodrag rounded-full bg-destructive p-0.5 text-destructive-foreground shadow-lg transition-colors hover:bg-destructive/90"
                aria-label="Delete title"
            >
                <X className="h-3 w-3" />
            </button>
        )}
        <Handle type="target" position={Position.Top} className="!bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="target" position={Position.Right} className="!bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="target" position={Position.Bottom} className="!bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="target" position={Position.Left} className="!bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
        {isEditing ? (
            <Textarea
                value={currentLabel}
                onChange={(e) => setCurrentLabel(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="nodrag w-full resize-none overflow-hidden border-none bg-transparent p-0 text-center shadow-none focus-visible:ring-0"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.2, color: 'hsl(var(--foreground))' }}
                aria-label="Title label"
                autoFocus
            />
        ) : (
            <div 
                className="w-full break-words p-0 text-center text-foreground"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.2 }}
            >
                {label || 'Edit Me'}
            </div>
        )}

        {selected && (
            <div className="absolute -bottom-12 left-1/2 w-40 -translate-x-1/2 rounded-full border bg-card/80 p-2 opacity-100 shadow-lg backdrop-blur-sm transition-opacity nodrag">
                <Slider
                    defaultValue={[fontSize]}
                    max={72}
                    min={12}
                    step={1}
                    onValueChange={handleFontSizeChange}
                    aria-label="Font size"
                />
            </div>
        )}

        <Handle type="source" position={Position.Top} className="!bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="source" position={Position.Right} className="!bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="source" position={Position.Bottom} className="!bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="source" position={Position.Left} className="!bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default memo(TitleNode);
