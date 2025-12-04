import { useEffect, useState } from '@rbxts/react';
import { BoundCheckOptions, useBoundCheck } from './useBoundCheck';

export interface ToolTipConfig {
	delayMs?: number; // Time before the ToolTip is shown
	content: string | number;
}

export interface ToolTipState {
	isShowing: boolean;
	pos: Vector2;
	content: string | number;
}

const DEFAULT_BOUND_OPTIONS: BoundCheckOptions = {
	topMostOnly: false,
	ignoreGuiInset: true,
	considerVisibility: true
};

export function useToolTip(
	targetRef: React.RefObject<GuiObject | undefined>,
	config: ToolTipConfig
) {
	const { delayMs = 100,content } = config;
	const [toolTipState, setToolTipState] = useState<ToolTipState | null>(null);

	const { withinBounds, bounds } = useBoundCheck(targetRef,DEFAULT_BOUND_OPTIONS);

	useEffect(() => {
		let timer: thread | undefined;

		if (withinBounds) {
			timer = task.delay(delayMs / 1000, () => {
				const pos = new Vector2(
					bounds.C1.X + bounds.Size.X / 2, // Center X
					bounds.C1.Y // Top Y
				);

				setToolTipState({
					isShowing: true,
					pos: pos,
					content: content
				});
				
			});
		} else setToolTipState(null);

		return () => {
			if (timer && coroutine.status(timer) !== "dead") task.cancel(timer);
		};
	},[withinBounds,bounds,delayMs,content]);
}