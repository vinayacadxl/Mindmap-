"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Image as ImageIcon } from 'lucide-react';

export type ImageData = {
    imageUrl: string;
    label?: string;
    onUpdateNode: (id: string, data: Record<string, any>) => void;
    onDeleteNode: (id: string) => void;
};

const ImageNode = ({ id, data, selected }: NodeProps<ImageData>) => {
    const { imageUrl, label, onDeleteNode } = data;

    return (
        <Card
            className={cn(
                "group relative min-w-[200px] max-w-[400px] overflow-hidden rounded-2xl border-2 shadow-sm transition-all duration-500",
                "bg-card/90 backdrop-blur-xl",
                selected ? 'border-primary shadow-primary/30 shadow-2xl scale-[1.02]' : 'border-border hover:shadow-2xl hover:shadow-primary/10 hover:translate-y-[-4px]'
            )}
        >
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteNode(id); }}
                className="absolute top-2 right-2 z-10 rounded-full p-1.5 text-white bg-black/50 opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100 backdrop-blur-md"
                aria-label="Delete image"
            >
                <X className="h-4 w-4" />
            </button>

            <Handle type="target" position={Position.Left} className="!bg-primary" />

            <div className="relative w-full overflow-hidden flex flex-col">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={label || "Uploaded image"}
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '400px' }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-muted/20">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">No image available</span>
                    </div>
                )}

                {label && (
                    <div className="p-3 bg-card/50 backdrop-blur-sm border-t border-border">
                        <p className="text-sm font-semibold truncate text-foreground">{label}</p>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="!bg-primary" />
        </Card>
    );
};

export default memo(ImageNode);
