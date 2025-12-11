import React, { useCallback, useContext, useEffect } from '@rbxts/react';
import { ContextMenuContext } from '../context/ContextMenuContext';

export type ContextItemData = string;

interface ContextItemProps extends Partial<React.ComponentPropsWithoutRef<'textbutton'>>{
	id: string | number;
	text: string;

	onActivate?: (...args: unknown[]) => void;
}

export function ContextMenuItem(props: ContextItemProps) {
	const {
		registerItemId,unregisterItemId,
		registerAction, unregisterAction, performAction,
		getLayoutOrder
	} = useContext(ContextMenuContext);

	const id = props.id;
	const text = props.text;

	useEffect(() => {
		registerItemId(id);
		return () => unregisterItemId(id);
	},[id,registerItemId,unregisterItemId]);

	useEffect(() => {
		if (props.onActivate && registerAction) {
			registerAction(id,props.onActivate);
			return () => {
				if (unregisterAction) unregisterAction(id);
			}
		}
		return undefined;
	},[id,props.onActivate,registerAction,unregisterAction]);

	const handleClick = React.useCallback(() => {
		if (performAction) performAction(id);
		else if (props.onActivate) props.onActivate();
	},[id,performAction,props.onActivate]);

	const nativeProps = { ...props } as Record<string,unknown>;
	delete nativeProps.id;
	delete nativeProps.text;
	delete nativeProps.onActivate;
	delete nativeProps.children;

	const layoutOrder = getLayoutOrder ? getLayoutOrder(id) : 0;

	return (
		<textbutton
			{...nativeProps}
			LayoutOrder={layoutOrder}
			Size={new UDim2(1,0,0,30)}
			Text={`{Item: ${id}} - ${text}`}
			Event={{ Activated: handleClick }}
		/>
	);
}