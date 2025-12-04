import React, { useState, useEffect, useCallback, useMemo, useRef } from '@rbxts/react';
import { Signal } from '@rbxts/beacon';
import { Players, RunService, UserInputService } from '@rbxts/services';

interface BoundCheckOptions {
	/** Should only the top-most element be considered? */
	topMostOnly: boolean;
	/** Should we ignore Roblox's default bar at the top of the screen during calculations. */
	ignoreGuiInset: boolean;
	/** Do we care if the element is visible or not? */
	considerVisibility: boolean;
}

interface BoundCoord {
	X: number;
	Y: number;
}

interface BoundsLayout {
	C1: BoundCoord;
	C2: BoundCoord;
	C3: BoundCoord;
	C4: BoundCoord;
	Size: BoundCoord;
}

const EmptyBoundsLayout = {
	C1: { X: 0,Y: 0 },
	C2: { X: 0,Y: 0 },
	C3: { X: 0,Y: 0 },
	C4: { X: 0,Y: 0 },
	Size: { X: 0,Y: 0 }
};

const PlayerGui = Players.LocalPlayer?.FindFirstChildOfClass("PlayerGui");

export function useBoundCheck(
	instRef: React.RefObject<GuiObject | undefined>,
	options: BoundCheckOptions
) {
	const { topMostOnly, ignoreGuiInset, considerVisibility } = options;

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
		if (!owner || !ancestorSG || !PlayerGui) return;

		// As of v0.1.0, bound check queries will only be calculated when a mouse position is available.
		const mousePos = UserInputService.GetMouseLocation();
		if (!mousePos) return;

		// Visibility check
		if (considerVisibility && !owner.Visible) {
			setWithinBounds(prev => {
				if (prev) boundExitRef.current.Fire();
				return false;
			});
			return;
		}

		// TopMostOnly check
		if (topMostOnly && PlayerGui) {
			const uis: GuiObject[] = PlayerGui.GetGuiObjectsAtPosition(mousePos.X,mousePos.Y);
			if (uis.size() === 0 || uis[0] !== owner) {
				if (withinBounds) {
					setWithinBounds(false);
					boundExitRef.current.Fire();
				}
				return;
			}
		}

		const absXSize: number = owner.AbsoluteSize.X;
		const absYSize: number = owner.AbsoluteSize.Y;

		const leftAbsX: number = owner.AbsolutePosition.X;
		const rightAbsX: number = leftAbsX + absXSize;

		const topAbsY: number = !ignoreGuiInset
			? owner.AbsolutePosition.Y - ancestorSG.AbsolutePosition.Y
			: owner.AbsolutePosition.Y;
		
		const bottomAbsY: number = topAbsY + absYSize;

		// Checking the bounds
		const withinX: boolean = mousePos.X >= leftAbsX && mousePos.X <= rightAbsX;
		const withinY: boolean = mousePos.Y >= topAbsY && mousePos.Y <= bottomAbsY;
		const inBounds: boolean = withinX && withinY;

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
			Size: { X: absXSize, Y: absYSize }
		});

		if (inBounds && !withinBounds) {
			setWithinBounds(true);
			boundEnterRef.current.Fire();
		} else if (!inBounds && withinBounds) {
			setWithinBounds(false);
			boundExitRef.current.Fire();
		}
	}, [
		topMostOnly,
		ignoreGuiInset,
		considerVisibility,
		instRef.current
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
	}),[queryBounds, instRef]);

	return {
		withinBounds,
		bounds,
		BoundEnter,
		BoundExit
	};
}