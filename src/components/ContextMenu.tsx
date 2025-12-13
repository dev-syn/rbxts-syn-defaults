import React, { ComponentPropsWithoutRef, PropsWithChildren, useCallback, useEffect, useRef, useState } from '@rbxts/react';
import { ContextMenuContext, ContextMenuID } from '../context/ContextMenuContext';
import { useContextMenu } from '../hooks/useContextMenu';
import { onOpenContextMenu } from '../registries/menuRegistry';
import { ContextMenuPortal, ContextMenuPortalConfig } from '../portals/ContextMenuPortal';

export interface ContextMenuProps extends PropsWithChildren,
Partial<ComponentPropsWithoutRef<'scrollingframe'>> {
	menuId: string;
	config?: ContextMenuPortalConfig;
}

export function ContextMenu(props: ContextMenuProps) {
	const menuId = props.menuId;
	const children = props.children;

	const [open, setOpen] = useState(false);
	const [activeTrigger, setActiveTrigger] = useState<GuiObject | undefined>(undefined);

	const { contextVal,itemIds } = useContextMenu({
		menuId: menuId,
		config: { activateAnywhere: false }
	});

	const handleMenuOpen = useCallback((menuId: ContextMenuID,node?: GuiObject) => {
		if (open) {
			setOpen(false);
			setActiveTrigger(undefined);
			return;
		}

		if (node) setActiveTrigger(node);

		setOpen(true);
	},[open]);

	useEffect(() => {
		onOpenContextMenu(menuId,handleMenuOpen);
		return () => onOpenContextMenu(menuId,undefined);
	},[menuId,handleMenuOpen]);

	const nativeProps = {...props} as Record<string,unknown>;
	delete nativeProps.menuId;
	delete nativeProps.children;
	delete nativeProps.config;

	
	return (
		<ContextMenuContext.Provider value={contextVal}>
			{open && 
			<ContextMenuPortal
				{...nativeProps}
				
				key={`ContextMenu-${menuId}`}
				triggerNode={activeTrigger}
				onClose={() => setOpen(false)}
				config={props.config}
			>
				{children}
			</ContextMenuPortal>}
		</ContextMenuContext.Provider>
	);
}