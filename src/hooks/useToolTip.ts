import { Binding, useBinding, useEffect, useState } from '@rbxts/react';
import { BoundCheckOptions, useBoundCheck } from './useBoundCheck';
import { GuiService, RunService, UserInputService } from '@rbxts/services';
import { calculateContentSize, CalculateContentProps } from '../helpers/calculateContentSize';
import { getGuiInset, getSafeZoneSize, getViewportSize } from '../helpers/utlilities';

interface ToolTipPosition {
	TargetRelative: "TargetRelative",
	MouseBased: "MouseBased"
}
export const ToolTipPosition: ToolTipPosition = {
	TargetRelative: "TargetRelative",
	MouseBased: "MouseBased"
};

interface GuiSide {
	Left: "Left",
	Top: "Top",
	Right: "Right",
	Bottom: "Bottom"
}
const GuiSide: GuiSide = {
	Left: 'Left',
	Top: 'Top',
	Right: 'Right',
	Bottom: 'Bottom'
};

export interface ToolTipConfig {
	content: string | number;
	/** Determines how the ToolTip gets positioned. */
	positioningMode: keyof typeof ToolTipPosition;
	/** How long will the ToolTip delay before being displayed. */
	delayMs?: number;
	/** Determines how the ToolTip will be position relative to the elements bounds. */
	anchorPos?: Vector2;
}

export interface ToolTipState {
	/** Where should the element be positioned */
	bind_pos: Binding<UDim2>;
	/** Is the ToolTip showing */
	isShowing: boolean;
	/**  What anchor point will we use for our positioning */
	anchorPos: Vector2;
	content: string | number;
	calculatedSize: Vector2;
}

const DEFAULT_BOUND_OPTIONS: BoundCheckOptions = {
	topMostOnly: false,
	considerVisibility: true
};

const INITIAL_SIZE = Vector2.zero;
export function useToolTip(
	targetRef: React.RefObject<GuiObject | undefined>,
	config: ToolTipConfig,
	textProps: Omit<CalculateContentProps,'text'>
): ToolTipState | undefined {
	const { delayMs = 0,content,positioningMode } = config;

	const [posBinding,setPosBinding] = useBinding(UDim2.fromOffset(0,0));

	const [toolTipState, setToolTipState] = useState<ToolTipState | undefined>(undefined);
	const [contentSize, setContentSize] = useState<Vector2>(INITIAL_SIZE);

	const { withinBounds, bounds } = useBoundCheck(targetRef,DEFAULT_BOUND_OPTIONS);

	// Async size calculation which will fetch the content size needed for the ToolTip
	useEffect(() => {
		if (!withinBounds) {
			setContentSize(INITIAL_SIZE);
			return;
		}

		let isCancelled: boolean = false;
		task.spawn(() => {
			const currentTarget = targetRef.current;
			const maxWidth = currentTarget?.AbsoluteSize.X ?? 400;

			const calculated: Vector2 = calculateContentSize({
				text: tostring(config.content),
				textSize: textProps.textSize,
				font: textProps.font,
				richText: textProps.richText
			},new Vector2(maxWidth,100000));

			if (!isCancelled) setContentSize(calculated);
		});

		return () => {
			isCancelled = true;
		}
	},[withinBounds,content,textProps.textSize,textProps.font,textProps.richText]);

	// Position & delay
	useEffect(() => {
		if (!withinBounds || contentSize === INITIAL_SIZE) {
			setToolTipState(undefined);
			return;
		}

		let delayThread: thread | undefined;
		let renderConn: RBXScriptConnection | undefined;

		let controlledPositioningMode: ToolTipConfig['positioningMode'] = positioningMode;

		const showToolTip = () => {
			const anchorPos = config.anchorPos ?? new Vector2(0.5,0);

			if (controlledPositioningMode === ToolTipPosition.MouseBased) {
				const [topLeft,_] = GuiService.GetGuiInset();

				renderConn = RunService.RenderStepped.Connect(() => {
					const mousePos = UserInputService.GetMouseLocation();
					const adjustedMousePos = new Vector2(mousePos.X - topLeft.X,mousePos.Y - topLeft.Y);

					const x = adjustedMousePos.X - anchorPos.X * contentSize.X;
					const y = adjustedMousePos.Y - anchorPos.Y * contentSize.Y;

					setPosBinding(UDim2.fromOffset(x,y));
				});
			} else if (controlledPositioningMode === ToolTipPosition.TargetRelative) {
				const anchorPoint = new Vector2(1 - anchorPos.X,1 - anchorPos.Y);

				const safeZoneSize = getSafeZoneSize();
				const { topLeft,botRight } = getGuiInset();

				const isSideOutOfBounds = (guiSide: keyof typeof GuiSide,xPos: number,yPos: number) => {
					switch(guiSide) {
						case GuiSide.Left:
							const isLeftOutOfView = xPos - contentSize.X < topLeft.X;
							return isLeftOutOfView;
						case GuiSide.Top:
							const isTopOutOfView = yPos - contentSize.Y < topLeft.Y;
							return isTopOutOfView;
						case GuiSide.Right:
							const isRightOutOfView = xPos + contentSize.X > safeZoneSize.X;
							return isRightOutOfView;
						case GuiSide.Bottom:
							const isBotOutOfView = yPos + contentSize.Y > safeZoneSize.Y;
							return isBotOutOfView;
						default:
							return error(`Unknown GuiSide: ${guiSide}`);
					}
				};

				// Calculate TargetRelative position using anchor Math
				let xPos = (bounds.C1.X + anchorPos.X * bounds.Size.X) - contentSize.X * anchorPoint.X;
				let yPos = (bounds.C1.Y + anchorPos.Y * bounds.Size.Y) - contentSize.Y * anchorPoint.Y;

				if (anchorPos.X > 0.5) {
					// Check if the right is out of bounds
					if (isSideOutOfBounds(GuiSide.Right,xPos,yPos)) {
						const adjustedX =
						(bounds.C1.X + (1 - anchorPos.X) * bounds.Size.X) -
						contentSize.X * (1 - anchorPoint.X);

						if (isSideOutOfBounds(GuiSide.Left,adjustedX,yPos)) {
							// Fallback to force on screen
							xPos = math.clamp(xPos,topLeft.X + contentSize.X,safeZoneSize.X - contentSize.X);
						} else xPos = adjustedX;
					}
				} else if (anchorPos.X < 0.5) {
					// Check if the left is out of bounds
					if (isSideOutOfBounds(GuiSide.Left,xPos,yPos)) {
						const adjustedX =
						(bounds.C1.X + (1 - anchorPos.X) * bounds.Size.X) -
						contentSize.X * (1 - anchorPoint.X);

						if (isSideOutOfBounds(GuiSide.Right,adjustedX,yPos)) {
							// Fallback to force on screen
							xPos = math.clamp(xPos,topLeft.X + contentSize.X,safeZoneSize.X - contentSize.X);
						} else xPos = adjustedX;
					}
				}

				if (anchorPos.Y > 0.5) {
					// Check if bottom is out of bounds
					if (isSideOutOfBounds(GuiSide.Bottom,xPos,yPos)) {
						const adjustedY =
						(bounds.C1.Y + (1 - anchorPos.Y) * bounds.Size.Y) -
						contentSize.Y * (1 - anchorPoint.Y);

						if (isSideOutOfBounds(GuiSide.Top,xPos,adjustedY)) {
							// Fallback to force on screen
							yPos = math.clamp(yPos,topLeft.Y + contentSize.Y,safeZoneSize.Y - contentSize.Y);
						} else yPos = adjustedY;
					}
				} else if (anchorPos.Y < 0.5) {
					// Check if the top is out of bounds
					if (isSideOutOfBounds(GuiSide.Top,xPos,yPos)) {
						const adjustedY =
						(bounds.C1.Y + (1 - anchorPos.Y) * bounds.Size.Y) -
						contentSize.Y * (1 - anchorPoint.Y);

						if (isSideOutOfBounds(GuiSide.Bottom,xPos,adjustedY)) {
							// Fallback to force on screen
							yPos = math.clamp(yPos,topLeft.Y + contentSize.Y,safeZoneSize.Y - contentSize.Y);
						} else yPos = adjustedY;
					}
				}

				setPosBinding(UDim2.fromOffset(xPos,yPos));
			} else { error(`Unknown ToolTipPosition.${controlledPositioningMode}? This member does not exist.`); }

      setToolTipState({
        isShowing: true,
        bind_pos: posBinding,
        anchorPos: anchorPos,
        content: content,
        calculatedSize: contentSize
      });
    };

		const preferredInput = UserInputService.PreferredInput;

		if (delayMs > 0) {
			delayThread = coroutine.create(() => {
				const delaySecs = delayMs / 1000;

				let elapsed = 0;
				while (elapsed < delaySecs) {
					const [dt] = RunService.Heartbeat.Wait();
					elapsed += dt;
				}

				if (
					controlledPositioningMode === ToolTipPosition.MouseBased &&
					preferredInput === Enum.PreferredInput.Touch ||
					preferredInput === Enum.PreferredInput.Gamepad
				) {
					// Mouse Based is not supported on Touch or Gamepad input types
					if (RunService.IsStudio()) warn(`ToolTipPosition.MouseBased is only allowed when the preferred input is 'KeyboardAndMouse'.`);
					controlledPositioningMode = ToolTipPosition.TargetRelative;
				}
				showToolTip();
			});
			coroutine.resume(delayThread);
		} else {
			if (
					controlledPositioningMode === ToolTipPosition.MouseBased &&
					preferredInput === Enum.PreferredInput.Touch ||
					preferredInput === Enum.PreferredInput.Gamepad
				)
				{
					// Mouse Based is not supported on Touch or Gamepad input types
					if (RunService.IsStudio()) warn(`ToolTipPosition.MouseBased is only allowed when the preferred input is 'KeyboardAndMouse'.`);
					controlledPositioningMode = ToolTipPosition.TargetRelative;
				}
				showToolTip();
		}

		return () => {
			if (delayThread && coroutine.status(delayThread) === 'suspended') task.cancel(delayThread);
			if (renderConn) renderConn.Disconnect();
		};
	},[
		withinBounds, // Was being in the bounds changed?
		bounds, // Has the bounds themself been updated?
		contentSize, // Has the ToolTip content size been updated?
		delayMs, // Has the delay changed?
		content, // Has the content itself changed?
		config.anchorPos, // Has the anchor position of this tool tip been changed?
		positioningMode, // Has the positioningMode been changed?,
		UserInputService.PreferredInput // Has the PreferredInput changed?
	]);

	return toolTipState;
}