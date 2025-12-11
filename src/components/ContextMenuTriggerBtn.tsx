import React, { useCallback, useContext } from '@rbxts/react';
import * as menuRegistry from '../registries/menuRegistry';

interface TriggerBtnProps extends Partial<
	React.ComponentPropsWithoutRef<'textbutton'>>
{
	menuId: string;
}

export function ContextMenuTriggerBtn(props: TriggerBtnProps) {
	const menuId = props.menuId;

	const ref = useCallback((node: TextButton | undefined) => {
		if (node) menuRegistry.registerTrigger(menuId, node as GuiObject);
		else menuRegistry.unregisterTrigger(menuId);
	},[menuId]);

	const native = { ...props } as Record<string,unknown>;
	delete native.menuId;
	delete native.children;

	return <textbutton ref={ref} {...native} />;
}