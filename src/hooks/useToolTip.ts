import { Binding, useBinding, useEffect, useState } from '@rbxts/react';
import { BoundCheckOptions, useBoundCheck } from './useBoundCheck';
import { GuiService, RunService, UserInputService } from '@rbxts/services';
import { calculateContentSize, CalculateContentProps } from '../helpers/calculateContentSize';

interface ToolTipPosition {
	TargetRelative: "TargetRelative",
	MouseBased: "MouseBased"
}
export const ToolTipPosition: ToolTipPosition = {
	TargetRelative: "TargetRelative",
	MouseBased: "MouseBased"
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

const INITIAL_SIZE = new Vector2(0,0);
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

		const showToolTip = () => {
			const anchorPos = config.anchorPos ?? new Vector2(0.5,0);

			const anchorPoint = new Vector2(1 - anchorPos.X,1 - anchorPos.Y);
			if (positioningMode === ToolTipPosition.MouseBased) {
				const [topLeft,_] = GuiService.GetGuiInset();

				renderConn = RunService.RenderStepped.Connect(() => {
					const mousePos = UserInputService.GetMouseLocation();
					const adjustedMousePos = new Vector2(mousePos.X - topLeft.X,mousePos.Y - topLeft.Y);

					const x = adjustedMousePos.X - anchorPos.X * contentSize.X;
					const y = adjustedMousePos.Y - anchorPos.Y * contentSize.Y;

					setPosBinding(UDim2.fromOffset(x,y));
				});
			} else if (positioningMode === ToolTipPosition.TargetRelative) {

				// Calculate TargetRelative position using anchor Math
				const xPos = (bounds.C1.X + anchorPos.X * bounds.Size.X) - contentSize.X * anchorPoint.X;
				const yPos = (bounds.C1.Y + anchorPos.Y * bounds.Size.Y) - contentSize.Y * anchorPoint.Y;

				setPosBinding(UDim2.fromOffset(xPos,yPos));
			} else { error(`Unknown ToolTipPosition.${positioningMode}? This member does not exist.`); }

      setToolTipState({
        isShowing: true,
        bind_pos: posBinding,
        anchorPos: anchorPos,
        content: content,
        calculatedSize: contentSize
      });
    };

		if (delayMs > 0) {
			delayThread = coroutine.create(() => {
				const delaySecs = delayMs / 1000;

				let elapsed = 0;
				while (elapsed < delaySecs) {
					const [dt] = RunService.Heartbeat.Wait();
					elapsed += dt;
				}
				showToolTip();
			});
			coroutine.resume(delayThread);
		} else showToolTip();

		return () => {
			if (delayThread && coroutine.status(delayThread) === 'suspended') task.cancel(delayThread);
			if (renderConn) renderConn.Disconnect();
		};
	},[withinBounds,bounds,contentSize,delayMs,content,config.anchorPos,positioningMode]);

	return toolTipState;
}