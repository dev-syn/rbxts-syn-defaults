import { PropsWithChildren, PropsWithRef, Ref, useEffect, useRef, useState } from '@rbxts/react';
import { createPortal } from '@rbxts/react-roblox';
import { ContextMenuRoot } from '../misc/ContextMenuRoot';
import React from '@rbxts/react';

interface ContextMenuProps extends PropsWithChildren {
	triggerNode?: GuiObject;
}

export function ContextMenuPortal({ triggerNode, children }: ContextMenuProps) {
	const ref = useRef<ScrollingFrame>(undefined);
	const [position,setPosition] = useState<UDim2>(new UDim2(0,0,0,0));

	useEffect(() => {
		if (!ref.current || !triggerNode) return;

		const menuSize = ref.current.AbsoluteSize;
		const viewportSize = game.Workspace.CurrentCamera!.ViewportSize;

		const absSizeY = triggerNode.AbsoluteSize.Y;
		const absPosY = triggerNode.AbsolutePosition.Y;
		const yAnchor = triggerNode.AnchorPoint.Y;

		const topAbsPosY = math.ceil(absPosY - absSizeY * yAnchor);
		const leftAbsPosX = triggerNode.AbsolutePosition.X - math.ceil(triggerNode.AbsoluteSize.X * triggerNode.AnchorPoint.X);

		const isSizeOverHalfX = leftAbsPosX > viewportSize.X / 2;
		const isSizeOverHalfY = absPosY > viewportSize.Y / 2;

		const xOffset = isSizeOverHalfX ? leftAbsPosX - menuSize.X : leftAbsPosX + triggerNode.AbsoluteSize.X;
		const yOffset = isSizeOverHalfY ? topAbsPosY - menuSize.Y : topAbsPosY;

		setPosition(UDim2.fromOffset(xOffset,yOffset));
	},[triggerNode]);

	return createPortal(
		<scrollingframe
			ref={ref}
			Position={UDim2.fromOffset(position.X.Offset,position.Y.Offset)}
			Size={UDim2.fromScale(1,1)}

			CanvasSize={new UDim2(0,0,0,0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollingDirection={Enum.ScrollingDirection.Y}
		>
			{children}
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
		</scrollingframe>,
		ContextMenuRoot
	);
}