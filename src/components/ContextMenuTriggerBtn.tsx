import React, { useCallback, useContext } from '@rbxts/react';
import { ContextMenuContext } from '../context/ContextMenuContext';

interface TriggerBtnProps extends Partial<
	React.ComponentPropsWithoutRef<'textbutton'>>
{
	menuId: string;
}

export function ContextMenuTriggerBtn(props: TriggerBtnProps) {
	const { registerTriggerRef, unregisterTriggerRef } =
		useContext(ContextMenuContext);

	const menuId = props.menuId;

	const ref = useCallback((node: TextButton | undefined) => {
		if (node) registerTriggerRef?.(menuId, node as GuiObject);
		else unregisterTriggerRef?.(menuId);
	},[menuId, registerTriggerRef, unregisterTriggerRef]);

	const native = { ...props } as Record<string,unknown>;
	delete native.menuId;
	delete native.children;

	return <textbutton ref={ref} {...native} />;
}