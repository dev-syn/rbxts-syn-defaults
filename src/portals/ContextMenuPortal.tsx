import { PropsWithChildren } from '@rbxts/react';
import { createPortal } from '@rbxts/react-roblox';
import { ContextMenuRoot } from '../misc/ContextMenuRoot';

interface ContextMenuProps extends PropsWithChildren {}

export function ContextMenuPortal({ children }: ContextMenuProps) {
	return createPortal(children,ContextMenuRoot);
}