import { ComponentPropsWithRef, PropsWithChildren, PropsWithRef, Ref, useEffect, useLayoutEffect, useRef, useState } from '@rbxts/react';
import { createPortal } from '@rbxts/react-roblox';
import { ContextMenuRoot } from '../misc/ContextMenuRoot';
import React from '@rbxts/react';
import { Players, RunService } from '@rbxts/services';

export interface ContextMenuPortalConfig {
	fullyVisibleOnly?: boolean;
}

function applyDefaultConfig(config?: ContextMenuPortalConfig) {
	if (!config) config = {};

	if (config.fullyVisibleOnly === undefined) config.fullyVisibleOnly = false;
}

interface ContextMenuProps extends PropsWithChildren,
Partial<ComponentPropsWithRef<'scrollingframe'>> {
	triggerNode?: GuiObject;
	onClose: () => void;
	config?: ContextMenuPortalConfig;
}

function isTriggerVisible(trigger: GuiObject,fullyVisibleOnly?: boolean): [boolean,ScrollingFrame | undefined] {
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

	let isOutOfView: boolean;

	if (fullyVisibleOnly) {
		isOutOfView =
		triggerTopY + 1e-2 < parentTopY ||
		triggerBottomY - 1e-2 > parentBottomY;
	} else {
		isOutOfView =
		triggerBottomY <= parentTopY ||
		triggerTopY >= parentBottomY;
	}

	return [!isOutOfView,parentScrollingFrame];
}

export function ContextMenuPortal(props: ContextMenuProps) {
	applyDefaultConfig(props.config);

	const triggerNode = props.triggerNode;
	const children = props.children;

	const ref = useRef<ScrollingFrame>(undefined);
	const listLayoutRef = useRef<UIListLayout>();

	const [position,setPosition] = useState<UDim2>(new UDim2(0,0,0,0));
	const [size,setSize] = useState<UDim2>(new UDim2(0,250,0,300));
	const [shouldRender,setShouldRender] = useState(true);

	useEffect(() => {
		if (!ref.current || !triggerNode) return;

		const updatePosition = () => {
			const menu = ref.current;
			if (!menu) return;
			
			const menuSize = menu.AbsoluteSize;
			
			const viewportSize = game.Workspace.CurrentCamera!.ViewportSize;

			const triggerTopLeftX = triggerNode.AbsolutePosition.X - (triggerNode.AbsoluteSize.X * triggerNode.AnchorPoint.X);
			const triggerTopLeftY = triggerNode.AbsolutePosition.Y - (triggerNode.AbsoluteSize.Y * triggerNode.AnchorPoint.Y);

			const defaultX = triggerTopLeftX + triggerNode.AbsoluteSize.X;
      const defaultY = triggerTopLeftY;
      
			let xOffset;
			let yOffset;

			// Horizontal Flip Check: Does the menu go past the right edge of the screen?
			if (defaultX + menuSize.X > viewportSize.X) xOffset = triggerTopLeftX - menuSize.X;
			else xOffset = defaultX;

			// Vertical Flip Check: Does the menu go past the bottom edge of the screen?
			if (defaultY + menuSize.Y > viewportSize.Y) yOffset = triggerTopLeftY - menuSize.Y;
			else yOffset = defaultY;
      
      // Clamp to prevent the menu from going off the left/top edges
      xOffset = math.max(xOffset,0);
      yOffset = math.max(yOffset,0);

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
			props.onClose();
			return;
		}

		const [initialVisible,parentScrollingFrame] = isTriggerVisible(triggerNode,props.config?.fullyVisibleOnly);
		setShouldRender(initialVisible);

		if (!initialVisible) {
			props.onClose();
			return;
		}

		const checkVisibility = () => {
			const [newVisible, ] = isTriggerVisible(triggerNode,props.config?.fullyVisibleOnly);

			if (!newVisible) props.onClose();

			if (newVisible !== shouldRender) setShouldRender(newVisible);
		};

		let scrollConn: RBXScriptConnection | undefined;

		if (parentScrollingFrame) scrollConn = parentScrollingFrame.GetPropertyChangedSignal("CanvasPosition").Connect(checkVisibility);

		const posConn = triggerNode.GetPropertyChangedSignal("AbsolutePosition").Connect(checkVisibility);

		return () => {
			scrollConn?.Disconnect();
			posConn.Disconnect();
		}
	},[triggerNode,props.onClose,shouldRender,props.config?.fullyVisibleOnly]);

	if (!triggerNode || !shouldRender) return undefined;

	const nativeProps = {...props} as Record<string,unknown>;
	delete nativeProps.triggerNode;
	delete nativeProps.onClose;
	delete nativeProps.config;

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