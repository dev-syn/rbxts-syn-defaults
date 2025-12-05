import { useEffect, useState } from '@rbxts/react';
import { BoundCheckOptions, useBoundCheck } from './useBoundCheck';
import { RunService } from '@rbxts/services';

const DEFAULT_ANCHOR = new Vector2(0,0);

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
	/** Is the ToolTip showing */
	isShowing: boolean;
	/** Where should the element be positioned */
	pos: Vector2;
	/**  What anchor point will we use for our positioning */
	anchorPos: Vector2;
	content: string | number;
}

const DEFAULT_BOUND_OPTIONS: BoundCheckOptions = {
	topMostOnly: false,
	considerVisibility: true
};

export function useToolTip(
	targetRef: React.RefObject<GuiObject | undefined>,
	config: ToolTipConfig
): ToolTipState | undefined {
	const { delayMs = 0,content } = config;
	const [toolTipState, setToolTipState] = useState<ToolTipState | undefined>(undefined);

	const { withinBounds, bounds } = useBoundCheck(targetRef,DEFAULT_BOUND_OPTIONS);

	const updateToolTipState = () => {
		const anchorPos = config.anchorPos !== undefined
		? config.anchorPos : DEFAULT_ANCHOR;
		
		// Top-left is how the underlying ToolTips element is positioned
		let xPos = bounds.C1.X + anchorPos.X * bounds.Size.X, yPos = bounds.C1.Y + anchorPos.Y * bounds.Size.Y;
		const pos = new Vector2(xPos,yPos);

		setToolTipState({
			isShowing: true,
			pos: pos,
			anchorPos: anchorPos,
			content: content
		});
	};

	const showToolTipWithDelay = () => {
		const delay = delayMs / 1000;
		let elapsed = 0;

		while (elapsed < delay) {
			const [dt] = RunService.Heartbeat.Wait();
			elapsed += dt;
		}

		updateToolTipState();
	};

	useEffect(() => {
		let delayThread: thread | undefined;

		if (withinBounds) {
			if (delayMs > 0) {
				delayThread = coroutine.create(showToolTipWithDelay);
				coroutine.resume(delayThread);
			} else updateToolTipState();
		} else setToolTipState(undefined);

		return () => {
			if (delayThread && coroutine.status(delayThread) === "suspended") task.cancel(delayThread);
		};
	},[withinBounds,bounds,delayMs,content]);
	return toolTipState;
}