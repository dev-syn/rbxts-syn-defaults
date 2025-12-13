import { ComponentPropsWithRef, PropsWithChildren, PropsWithRef, Ref, useEffect, useLayoutEffect, useRef, useState } from '@rbxts/react';
import { createPortal } from '@rbxts/react-roblox';
import { ContextMenuRoot } from '../misc/ContextMenuRoot';
import React from '@rbxts/react';
import { Players, RunService } from '@rbxts/services';

interface ContextMenuProps extends PropsWithChildren,
Partial<ComponentPropsWithRef<'scrollingframe'>> {
	triggerNode?: GuiObject;
}

function isTriggerVisible(trigger: GuiObject): [boolean,ScrollingFrame | undefined] {
	let rootUI: PlayerGui | CoreGui;
	if (RunService.IsStudio()) rootUI = game.GetService("CoreGui");
	else rootUI = Players.LocalPlayer.FindFirstChild("PlayerGui") as PlayerGui;
	
	let parentScrollingFrame: ScrollingFrame | undefined;
	let currentParent = trigger.Parent;

	while (currentParent && currentParent !== rootUI) {
		if (currentParent.IsA("ScrollingFrame")) {
			parentScrollingFrame = currentParent;
			break;
		}
		currentParent = currentParent.Parent;
	}
	
	if (!parentScrollingFrame) return [true,undefined];

	const parentFrame = parentScrollingFrame!;

	const parentTopY = parentFrame.AbsolutePosition.Y;
	const parentBottomY = parentTopY + parentFrame.AbsoluteSize.Y;

	const triggerTopY = trigger.AbsolutePosition.Y;
	const triggerBottomY = triggerTopY + trigger.AbsoluteSize.Y;

	const isOutOfView =
		triggerBottomY <= parentTopY ||
		triggerTopY >= parentBottomY;

	return [!isOutOfView,parentScrollingFrame];
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

		const updatePosition = () => {
			const menu = ref.current;
			if (!menu) return;
			
			const menuSize = menu.AbsoluteSize;
			
			const viewportSize = game.Workspace.CurrentCamera!.ViewportSize;

			const triggerTopLeftX = triggerNode.AbsolutePosition.X - (triggerNode.AbsoluteSize.X * triggerNode.AnchorPoint.X);
			const triggerTopLeftY = triggerNode.AbsolutePosition.Y - (triggerNode.AbsoluteSize.Y * triggerNode.AnchorPoint.Y);

			const isOverHalfX = triggerNode.AbsolutePosition.X > viewportSize.X / 2;
			const isOverHalfY = triggerNode.AbsolutePosition.Y > viewportSize.Y / 2;

			const xOffset = isOverHalfX ? triggerTopLeftX - menuSize.X : triggerTopLeftX + triggerNode.AbsoluteSize.X;
			const yOffset = isOverHalfY ? triggerTopLeftY - menuSize.Y : triggerTopLeftY + triggerNode.AbsoluteSize.Y;

			setPosition(UDim2.fromOffset(xOffset,yOffset));
		};

		updatePosition();

		const posConn = triggerNode.GetPropertyChangedSignal("AbsolutePosition").Connect(updatePosition);
		const sizeConn = triggerNode.GetPropertyChangedSignal("AbsoluteSize").Connect(updatePosition);

		return () => {
			posConn.Disconnect();
			sizeConn.Disconnect();
		};
	},[triggerNode,size]);

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

		const [initialVisible,parentScrollingFrame] = isTriggerVisible(triggerNode);
		setIsVisible(initialVisible);

		const checkVisibility = () => {
			const [newVisible, ] = isTriggerVisible(triggerNode);

			if (newVisible !== isVisible) setIsVisible(newVisible);
		};

		checkVisibility();

		let scrollConn: RBXScriptConnection | undefined;

		if (parentScrollingFrame) scrollConn = parentScrollingFrame.GetPropertyChangedSignal("CanvasPosition").Connect(checkVisibility);

		const posConn = triggerNode.GetPropertyChangedSignal("AbsolutePosition").Connect(checkVisibility);

		return () => {
			scrollConn?.Disconnect();
			posConn.Disconnect();
		}
	},[triggerNode,isVisible]);

	if (!triggerNode || !isVisible) return undefined;

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