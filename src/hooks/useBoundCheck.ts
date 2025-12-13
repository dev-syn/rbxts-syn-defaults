import React, { useState, useEffect, useCallback, useMemo, useRef } from '@rbxts/react';
import { Signal } from '@rbxts/beacon';
import { Players, RunService, UserInputService, GuiService } from '@rbxts/services';

export interface BoundCheckOptions {
	/** Should only the top-most element be considered */
	topMostOnly: boolean;
	/** Do we care if the element is visible or not */
	considerVisibility: boolean;
}

interface BoundCoord {
	X: number;
	Y: number;
}

interface BoundsLayout {
	/** The absolute position of the top-left corner of this bounding box */
	C1: BoundCoord;
	/** The absolute position of the top-right corner of this bounding box */
	C2: BoundCoord;
	/** The absolute position of the bottom-left corner of this bounding box */
	C3: BoundCoord;
	/** The absolute position of the bottom-right corner of this bounding box */
	C4: BoundCoord;
	/** The size in pixels of this bounding box */
	Size: BoundCoord;
	/**
	 * The last charted position of the mouse.
	 * (Note: This mouse position has been adjusted to reflect the GuiInset.)
	 */
	LastChartedMousePos: Vector2 | undefined;
}

const EmptyBoundsLayout: BoundsLayout = {
	C1: { X: 0,Y: 0 },
	C2: { X: 0,Y: 0 },
	C3: { X: 0,Y: 0 },
	C4: { X: 0,Y: 0 },
	Size: { X: 0,Y: 0 },
	LastChartedMousePos: undefined
};

export function useBoundCheck(
	instRef: React.RefObject<GuiObject | undefined>,
	options: BoundCheckOptions
) {
	const { topMostOnly, considerVisibility } = options;

	// Create the state that manages when within bounds
	const [withinBounds, setWithinBounds] = useState(false);

	// State for the latest calculation of the bounds data
	const [bounds, setBounds] = useState(EmptyBoundsLayout);

	// React reference for our bound check signals
	const boundEnterRef = useRef(new Signal<void>);
	const boundExitRef = useRef(new Signal<void>);

	const BoundEnter = useMemo(() => boundEnterRef.current, []);
	const BoundExit = useMemo(() => boundExitRef.current, []);

	// Memoize lookup of the ancestor ScreenGui
	const ancestorSGRef = useRef<ScreenGui>();

	useEffect(() => {
		const owner = instRef.current;
		if (owner && !ancestorSGRef.current) {
			const ancestor = owner.FindFirstAncestorWhichIsA("ScreenGui");
			if (!ancestor) {
				warn("BoundCheck is missing a ScreenGui ancestor. No bounds will be queried.");
				return;
			}
			ancestorSGRef.current = ancestor;
		}
	}, [instRef.current]);

	const queryBounds = useCallback(() => {
		const owner = instRef.current;
		const ancestorSG = ancestorSGRef.current;
		// Exit if neccessary services/objects are missing
		const PlayerGui = Players.LocalPlayer?.FindFirstChildOfClass("PlayerGui");

		if (!owner || !ancestorSG || !PlayerGui) return;

		// The size of the bounds element
		const absXSize: number = owner.AbsoluteSize.X;
		const absYSize: number = owner.AbsoluteSize.Y;

		// The positioning points of the bounds element
		const leftAbsX: number = owner.AbsolutePosition.X - (owner.AbsoluteSize.X * owner.AnchorPoint.X);
		const rightAbsX: number = leftAbsX + absXSize;
		const topAbsY: number = owner.AbsolutePosition.Y - (owner.AbsoluteSize.Y * owner.AnchorPoint.Y);
		const bottomAbsY: number = topAbsY + absYSize;

		let withinX: boolean = false;
		let withinY: boolean = false;
		let inBounds: boolean = false;

		let lastChartedMousePos: Vector2 | undefined = undefined;
		let topCheckingPoint: Vector2 | undefined = undefined;

		const preferredInput = UserInputService.PreferredInput;
		if (preferredInput === Enum.PreferredInput.KeyboardAndMouse) {
			const mousePos = UserInputService.GetMouseLocation();
			if (!mousePos) return;

			const [topLeft,_] = GuiService.GetGuiInset();
			const adjustedMousePos = new Vector2(mousePos.X - topLeft.X,mousePos.Y - topLeft.Y);

			// Checking the bounds
			withinX = adjustedMousePos.X >= leftAbsX && adjustedMousePos.X <= rightAbsX;
			withinY = adjustedMousePos.Y >= topAbsY && adjustedMousePos.Y <= bottomAbsY;
			inBounds = withinX && withinY;

			lastChartedMousePos = adjustedMousePos;
			topCheckingPoint = adjustedMousePos;
		} else {
			inBounds = owner.GuiState === Enum.GuiState.Press || owner.GuiState === Enum.GuiState.Hover ?
				true : false;
			topCheckingPoint = new Vector2(leftAbsX,topAbsY);
		}

		setWithinBounds(prevWithinBounds => {
		// Visibility check
		if (considerVisibility && !owner.Visible) {
			if (prevWithinBounds) boundExitRef.current.Fire();
			return false;
		}

		// TopMostOnly check
		if (topMostOnly && inBounds) {
			const uis: GuiObject[] = PlayerGui.GetGuiObjectsAtPosition(
				topCheckingPoint.X,
				topCheckingPoint.Y
			);
			if (uis.size() === 0 || uis[0] !== owner) inBounds = false;
		}

		if (inBounds && !prevWithinBounds) {
			setBounds({
				// Top Left
				C1: { X: leftAbsX,Y: topAbsY},
				// Top Right
				C2: { X: rightAbsX,Y: topAbsY},
				// Bottom Left
				C3: { X: leftAbsX,Y: bottomAbsY},
				// Bottom Right
				C4: { X: rightAbsX,Y: bottomAbsY},
				// Bound Size
				Size: { X: absXSize, Y: absYSize },
				LastChartedMousePos: lastChartedMousePos
			});

			boundEnterRef.current.Fire();
			return true;
		} else if (!inBounds && prevWithinBounds) {
			boundExitRef.current.Fire();
			return false;
		}

		return prevWithinBounds;
	});

	},[
		topMostOnly,
		considerVisibility,
		instRef.current,
		instRef.current?.AbsoluteSize,
		instRef.current?.AbsolutePosition,
		instRef.current?.AbsoluteRotation
	]);

	useEffect((() => {
		const instanceID = instRef.current ? tostring(instRef.current) : "N/A";
		const connectionID = `UIPresets_BoundCheck_${instanceID}`;

		RunService.BindToRenderStep(
			connectionID,
			Enum.RenderPriority.Input.Value + 5,
			queryBounds
		);

		return () => {
			RunService.UnbindFromRenderStep(connectionID);
			boundEnterRef.current.Destroy();
			boundExitRef.current.Destroy();
		}
	}),[queryBounds,instRef.current]);

	return {
		withinBounds,
		bounds,
		BoundEnter,
		BoundExit
	};
}