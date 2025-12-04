import React, { PropsWithChildren } from '@rbxts/react';
import { createPortal } from '@rbxts/react-roblox';
import { ToolTipRoot } from '../misc/ToolTipRoot';

interface ToolTipPortalProps extends PropsWithChildren {}

export function ToolTipPortal({ children }: ToolTipPortalProps) {
	return createPortal(children,ToolTipRoot);
}