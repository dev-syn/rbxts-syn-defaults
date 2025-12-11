import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from '@rbxts/react';
import { ContextMenuContext, ContextMenuID } from '../context/ContextMenuContext';
import { useContextMenu } from '../hooks/useContextMenu';
import { onOpenContextMenu } from '../registries/menuRegistry';
import { ContextMenuPortal } from '../portals/ContextMenuPortal';

export interface ContextMenuProps extends PropsWithChildren {
	menuId: string;
}

export function ContextMenu({ menuId,children }: ContextMenuProps) {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState<UDim2>(new UDim2(0,0,0,0));
	const [activeTrigger, setActiveTrigger] = useState<ContextMenuID | undefined>(undefined);

	const { contextVal,itemIds } = useContextMenu({
		menuId: menuId,
		config: { activateAnywhere: false }
	});

	const menuRef = useRef<ScrollingFrame>();

	const handleMenuOpen = useCallback((menuId: ContextMenuID,node?: GuiObject) => {
		if (!menuRef.current) {
			print("No ref");
			return;
		}
		const contextMenu = menuRef.current;

		if (open) {
			print(`Closing context menu: ${menuId}`);
			setOpen(false);
			return;
		}

		if (node) {
			const viewportSize: Vector2 = game.Workspace.CurrentCamera!.ViewportSize;

			const absSizeY: number = node.AbsoluteSize.Y;
			const absPosY: number = node.AbsolutePosition.Y;

			const yAnchor: number = node.AnchorPoint.Y;

			const topAbsPosY: number = math.ceil(absPosY - absSizeY * yAnchor);
			const leftAbsPosX = node.AbsolutePosition.X - math.ceil(node.AbsoluteSize.X * node.AnchorPoint.X);
			const rightAbsPosX = leftAbsPosX + contextMenu.AbsoluteSize.X;

			// Position the menu before open
			const isSizeOverHalfX: boolean = leftAbsPosX > viewportSize.X / 2;
			const isSizeOverHalfY: boolean = absPosY > viewportSize.Y / 2;

			const xOffset = isSizeOverHalfX ?
			leftAbsPosX - contextMenu.AbsoluteSize.X
			: rightAbsPosX + (node.AbsoluteSize.X - contextMenu.AbsoluteSize.X);

			const yOffset = isSizeOverHalfY ?
			(topAbsPosY + -(contextMenu.AbsoluteSize.Y - math.ceil(1 / viewportSize.Y) * contextMenu.AbsoluteSize.Y))
			: topAbsPosY;

			setPos(UDim2.fromOffset(xOffset,yOffset));
		}

		print(`Opening context menu: ${menuId}`);
		setOpen(true);
	},[open,pos]);

	useEffect(() => {
		onOpenContextMenu(menuId,handleMenuOpen);
		return () => onOpenContextMenu(menuId,undefined);
	},[menuId,handleMenuOpen]);

	
	return (
		<ContextMenuContext.Provider value={contextVal}>
			{open && 
			<ContextMenuPortal
				menuRef={menuRef}
				key={`ContextMenu-${menuId}`}
				position={pos}
			>
				{children}
			</ContextMenuPortal>}
		</ContextMenuContext.Provider>
	);
}