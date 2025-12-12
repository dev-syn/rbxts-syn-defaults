import { ComponentPropsWithRef, PropsWithChildren, PropsWithRef, Ref, useEffect, useLayoutEffect, useRef, useState } from '@rbxts/react';
import { createPortal } from '@rbxts/react-roblox';
import { ContextMenuRoot } from '../misc/ContextMenuRoot';
import React from '@rbxts/react';
import { Players, RunService, StarterGui } from '@rbxts/services';

interface ContextMenuProps extends PropsWithChildren,
Partial<ComponentPropsWithRef<'scrollingframe'>> {
	triggerNode?: GuiObject;
}

export function ContextMenuPortal(props: ContextMenuProps) {
	const triggerNode = props.triggerNode;
	const children = props.children;

	const ref = useRef<ScrollingFrame>(undefined);
	const listLayoutRef = useRef<UIListLayout>();

	const [position,setPosition] = useState<UDim2>(new UDim2(0,0,0,0));
	const [size,setSize] = useState<UDim2>(new UDim2(0,250,0,300));
	const [isVisible,setIsVisible] = useState(true);

	useEffect(() => {
		if (!ref.current || !triggerNode) return;
		print(`Ref current: ${ref.current}, triggerNode: ${triggerNode}`);

		const updatePosition = () => {
			const menu = ref.current;
			if (!menu) return;
			
			const menuSize = menu.AbsoluteSize;
			
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
		};

		updatePosition();

		const posConn = triggerNode.GetPropertyChangedSignal("AbsolutePosition").Connect(updatePosition);
		const sizeConn = triggerNode.GetPropertyChangedSignal("AbsoluteSize").Connect(updatePosition);

		return () => {
			posConn.Disconnect();
			sizeConn.Disconnect();
		};
	},[triggerNode,size,children]);

	useEffect(() => {
		const layout = listLayoutRef.current;
		if (!layout) return;

		const updateSize = () => {
			const absSize = layout.AbsoluteContentSize;
			setSize(UDim2.fromOffset(absSize.X,absSize.Y));
		};

		updateSize();

		const conn = layout.GetPropertyChangedSignal("AbsoluteContentSize").Connect(updateSize);

		return () => conn.Disconnect();
	},[children]);

	useEffect(() => {
		if (!triggerNode) {
			setIsVisible(false);
			return;
		}

		let parentScrollingFrame: ScrollingFrame | undefined;
		let currentParent = triggerNode.Parent;

		let localPlayerGui
		while(currentParent && RunService.IsStudio() ? game.GetService("CoreGui") : Players.LocalPlayer?.FindFirstChild("PlayerGui")) {
			if ()
		}
	},[]);

	const nativeProps = {...props};
	delete nativeProps.triggerNode;

	return createPortal(
		<scrollingframe
			ref={ref}

			{...nativeProps}

			Position={UDim2.fromOffset(position.X.Offset,position.Y.Offset)}
			Size={UDim2.fromOffset(size.X.Offset,size.Y.Offset)}
			CanvasSize={new UDim2(0,0,0,0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollingDirection={Enum.ScrollingDirection.Y}
		>
			{children}
			<uilistlayout
				ref={listLayoutRef}
				FillDirection={Enum.FillDirection.Vertical}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
		</scrollingframe>,
		ContextMenuRoot
	);
}