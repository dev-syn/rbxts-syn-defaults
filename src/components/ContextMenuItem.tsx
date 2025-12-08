import React, { useContext, useEffect } from '@rbxts/react';
import { ContextMenuContext } from '../context/ContextMenuContext';

export type ContextItemData = string;

interface ContextItemProps extends Partial<React.ComponentPropsWithoutRef<'textbutton'>>{
	id: string | number;
	text: string;
}

export function ContextMenuItem(props: ContextItemProps) {
	const { registerItemId,unregisterItemId,getLayoutOrder } = useContext(ContextMenuContext);

	const id = props.id;
	const text = props.text;

	useEffect(() => {
		registerItemId(id);
		return () => unregisterItemId(id);
	},[id,registerItemId,unregisterItemId]);

	const nativeProps = { ...props } as Record<string,unknown>;
	delete nativeProps.id;
	delete nativeProps.text;

	const layoutOrder = getLayoutOrder ? getLayoutOrder(id) : 0;

	return (
		<textbutton
			{...nativeProps}
			LayoutOrder={layoutOrder}
			Size={new UDim2(1,0,0,30)}
			Text={`{Item: ${id}} - ${text}`}
		/>
	);
}